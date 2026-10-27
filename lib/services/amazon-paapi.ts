/**
 * Amazon Product Advertising API 5.0 (PA-API 5.0) Client
 * Uses Web Crypto API (crypto.subtle) for AWS Signature Version 4 (SigV4).
 * Fully compatible with Node.js, Next.js Edge runtime, and Cloudflare Workers.
 */

export interface PAAPIItem {
  ASIN: string;
  DetailPageURL?: string;
  Images?: {
    Primary?: {
      Large?: { URL: string; Height: number; Width: number };
      Medium?: { URL: string };
    };
  };
  ItemInfo?: {
    Title?: { DisplayValue: string };
    ByLineInfo?: { Brand?: { DisplayValue: string } };
    Classifications?: { Binding?: { DisplayValue: string } };
    Features?: { DisplayValues: string[] };
    ProductInfo?: {
      ItemDimensions?: Record<string, unknown>;
    };
  };
  Offers?: {
    Listings?: Array<{
      Id: string;
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
        Savings?: {
          Amount: number;
          Percentage: number;
        };
      };
      SavingBasis?: {
        Amount: number;
        DisplayAmount: string;
      };
      Availability?: {
        Message?: string;
        Type?: string;
      };
      IsBuyBoxWinner?: boolean;
    }>;
  };
}

export interface PAAPISearchResponse {
  SearchResult?: {
    TotalResultCount?: number;
    Items?: PAAPIItem[];
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

export interface PAAPIGetItemsResponse {
  ItemsResult?: {
    Items?: PAAPIItem[];
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

const HOST = "webservices.amazon.in";
const REGION = "eu-west-1";
const SERVICE = "ProductAdvertisingAPI";

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: Uint8Array | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const rawKey = key instanceof Uint8Array ? (key.buffer as ArrayBuffer) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey as any,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const kSecret = encoder.encode("AWS4" + key);
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

export function isPAAPIConfigured(): boolean {
  return Boolean(
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY &&
    (process.env.AMAZON_ASSOCIATES_TAG || process.env.NEXT_PUBLIC_AMAZON_TAG)
  );
}

export async function sendPAAPIRequest<T>(
  target: string,
  payload: Record<string, unknown>
): Promise<T | null> {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag =
    process.env.AMAZON_ASSOCIATES_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_TAG ||
    "dealfinderin-21";

  if (!accessKey || !secretKey) {
    return null;
  }

  const endpoint = `https://${HOST}/paapi5/${target.toLowerCase()}`;
  const path = `/paapi5/${target.toLowerCase()}`;
  const requestBody = JSON.stringify({
    ...payload,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in",
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256Hex(requestBody);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${target}\n`;

  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest =
    `POST\n` +
    `${path}\n` +
    `\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const canonicalRequestHash = await sha256Hex(canonicalRequest);

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign =
    `AWS4-HMAC-SHA256\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${canonicalRequestHash}`;

  const signingKey = await getSignatureKey(secretKey, dateStamp, REGION, SERVICE);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 ` +
    `Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-encoding": "amz-1.0",
        "content-type": "application/json; charset=utf-8",
        host: HOST,
        "x-amz-date": amzDate,
        "x-amz-target": `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${target}`,
        Authorization: authorizationHeader,
      },
      body: requestBody,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[PA-API 5.0] Request ${target} failed (${res.status}):`, errText);
      return null;
    }

    const data = (await res.json()) as T;
    return data;
  } catch (err) {
    console.warn(`[PA-API 5.0] Network/execution error:`, err);
    return null;
  }
}
