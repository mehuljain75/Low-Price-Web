import subprocess
import os

FFMPEG = "/Users/admin/.gemini/antigravity/bin/ffmpeg"
MUSIC_SRC = "demo-video/composition/assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3"
SFX_DIR = "demo-video/composition/assets/sfx/ph"
VO_DIR = "demo-video/composition/assets/vo"
OUT_WAV = "demo-video/composition/assets/voiceover.wav"

TOTAL_DURATION = 210.0 # 3m 30s at 30fps = 6,300 frames

# Exact start times based on probe
vo_schedule = [
    (0, 0.5),      # Hook (0.5s - 22.94s)
    (1, 24.0),     # Product Intro (24.0s - 43.86s)
    (2, 45.0),     # Feature 1: Universal Search (45.0s - 63.43s)
    (3, 64.5),     # Feature 2: Comparison Matrix (64.5s - 84.98s)
    (4, 86.0),     # Feature 3: Bank Calculator (86.0s - 107.33s)
    (5, 108.5),    # Feature 4: Price History & Expose (108.5s - 126.55s)
    (6, 127.8),    # Feature 5: Dynamic Filters (127.8s - 144.68s)
    (7, 146.0),    # Feature 6: Today's Deals (146.0s - 161.72s)
    (8, 163.0),    # Feature 7: Sales Calendar (163.0s - 180.79s)
    (9, 182.0),    # Grand Outro & CTA (182.0s - 196.08s)
]

# SFX cues: (file, start_sec, volume)
sfx_cues = [
    # Sub-bass impacts
    (f"{SFX_DIR}/impact-bass-1.mp3", 0.5, 0.8),
    (f"{SFX_DIR}/impact-bass-1.mp3", 24.0, 0.75),
    (f"{SFX_DIR}/impact-bass-1.mp3", 182.0, 0.7),
    (f"{SFX_DIR}/impact-bass-1.mp3", 188.0, 0.85),

    # Transition whooshes on act bumpers
    (f"{SFX_DIR}/whoosh-cinematic.mp3", 23.5, 0.45),
    (f"{SFX_DIR}/whoosh.mp3", 44.5, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 64.0, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 85.5, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 108.0, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 127.2, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 145.5, 0.4),
    (f"{SFX_DIR}/whoosh.mp3", 162.5, 0.4),
    (f"{SFX_DIR}/whoosh-cinematic.mp3", 181.5, 0.55),

    # UI Interaction clicks
    (f"{SFX_DIR}/click.mp3", 48.0, 0.7),   # Typing & search focus
    (f"{SFX_DIR}/click.mp3", 52.5, 0.75),  # Autocomplete selection
    (f"{SFX_DIR}/click.mp3", 69.0, 0.7),   # Table row click
    (f"{SFX_DIR}/click.mp3", 91.0, 0.7),   # HDFC card select
    (f"{SFX_DIR}/click.mp3", 96.0, 0.7),   # ICICI card select
    (f"{SFX_DIR}/click.mp3", 114.0, 0.7),  # Price history point hover
    (f"{SFX_DIR}/click.mp3", 132.0, 0.7),  # Category click
    (f"{SFX_DIR}/click.mp3", 135.0, 0.7),  # Brand checkbox
    (f"{SFX_DIR}/click.mp3", 150.0, 0.7),  # Discount tab select
    (f"{SFX_DIR}/click.mp3", 167.0, 0.7),  # Festival calendar view
    (f"{SFX_DIR}/click.mp3", 184.5, 0.8),  # WhatsApp share click

    # Notification chimes & payoffs
    (f"{SFX_DIR}/notification.mp3", 72.0, 0.65),  # Lowest price certification
    (f"{SFX_DIR}/notification.mp3", 93.0, 0.7),   # Bank discount instant deduction
    (f"{SFX_DIR}/pop.mp3", 118.0, 0.8),           # All-Time Low detected badge
    (f"{SFX_DIR}/pop.mp3", 153.0, 0.7),           # Verified drop pop
    (f"{SFX_DIR}/notification.mp3", 186.0, 0.75), # WhatsApp shared confirmation
]

# Build ffmpeg command
inputs = []
filter_parts = []

# Input 0..9: VO files
vo_stream_names = []
for idx, (vo_id, start_s) in enumerate(vo_schedule):
    fpath = f"{VO_DIR}/vo{vo_id}.wav"
    inputs.extend(["-i", fpath])
    delay_ms = int(start_s * 1000)
    filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a_vo_{idx}];")
    vo_stream_names.append(f"[a_vo_{idx}]")

# Combine VO bus with normalize=0 so sequential chunks do not attenuate each other
filter_parts.append(
    f"{''.join(vo_stream_names)}amix=inputs={len(vo_schedule)}:normalize=0,"
    f"compand=attacks=0.02:decays=0.2:points=-60/-60|-24/-18|0/-1.5:soft-knee=6[vo_bus];"
)

# Input 10..N: SFX files
sfx_start_idx = len(vo_schedule)
sfx_stream_names = []
for idx, (sfx_file, start_s, vol) in enumerate(sfx_cues):
    input_idx = sfx_start_idx + idx
    inputs.extend(["-i", sfx_file])
    delay_ms = int(start_s * 1000)
    filter_parts.append(f"[{input_idx}:a]adelay={delay_ms}|{delay_ms},volume={vol}[a_sfx_{idx}];")
    sfx_stream_names.append(f"[a_sfx_{idx}]")

# Combine SFX bus
filter_parts.append(
    f"{''.join(sfx_stream_names)}amix=inputs={len(sfx_cues)}:normalize=0[sfx_bus];"
)

# Music input: looped
music_input_idx = sfx_start_idx + len(sfx_cues)
inputs.extend(["-stream_loop", "-1", "-i", MUSIC_SRC])
filter_parts.append(f"[{music_input_idx}:a]volume=0.20,afade=t=out:st=206.0:d=4.0[bgm_bus];")

# Master 3-bus mix with broadcast-standard loudnorm (-14 LUFS)
filter_parts.append(
    "[vo_bus][sfx_bus][bgm_bus]amix=inputs=3:normalize=0,"
    "loudnorm=I=-14:LRA=7:TP=-1.5[out_a]"
)

filter_complex = "".join(filter_parts)

cmd = [
    FFMPEG,
    "-y",
    *inputs,
    "-filter_complex", filter_complex,
    "-map", "[out_a]",
    "-t", str(TOTAL_DURATION),
    "-ar", "48000",
    "-ac", "2",
    OUT_WAV
]

print("Mixing master audio track...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg error:", res.stderr)
    exit(1)

print(f"Master audio generated: {OUT_WAV} ({TOTAL_DURATION}s)")
