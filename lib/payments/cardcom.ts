/**
 * Thin wrapper around CardCom's v11 JSON API.
 *
 * Integration shape:
 *   1. createLowProfile() — opens a hosted payment session. Returns a URL
 *      the patient is redirected to. Operation = "ChargeAndCreateToken" or
 *      "CreateTokenOnly" depending on `Operation` arg. We use CreateTokenOnly
 *      so the patient enters their card at booking but no charge happens
 *      until the practitioner approves.
 *   2. getLowProfileResult() — called from /api/cardcom/success after the
 *      patient returns from CardCom; verifies the session and pulls the
 *      saved token + the transaction details.
 *   3. chargeToken() — called server-side when the practitioner approves;
 *      runs the actual charge against the stored token.
 *   4. refundTransaction() — called on cancellation >24h before treatment.
 *
 * All calls are guarded by `isCardcomEnabled()` — when the flag is false
 * the booking flow keeps using the existing mock so production stays safe
 * until you flip CARDCOM_ENABLED=true.
 */

const CARDCOM_BASE_URL = "https://secure.cardcom.solutions/api/v11";

export function isCardcomEnabled(): boolean {
  return process.env.CARDCOM_ENABLED === "true";
}

function requireConfig() {
  const terminal = process.env.CARDCOM_TERMINAL_NUMBER;
  const apiName = process.env.CARDCOM_API_NAME;
  const apiPassword = process.env.CARDCOM_API_PASSWORD;
  if (!terminal || !apiName || !apiPassword) {
    throw new Error("CardCom is enabled but missing env vars (CARDCOM_TERMINAL_NUMBER / CARDCOM_API_NAME / CARDCOM_API_PASSWORD)");
  }
  return { terminal: Number(terminal), apiName, apiPassword };
}

type CardcomResult<T> = { success: true; data: T } | { success: false; error: string };

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<CardcomResult<T>> {
  try {
    const res = await fetch(`${CARDCOM_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as Record<string, unknown>;
    // CardCom returns ResponseCode = 0 for success; non-zero with Description for failures.
    const responseCode = json.ResponseCode as number | undefined;
    if (responseCode !== 0) {
      const description = (json.Description as string) ?? `CardCom error ${responseCode}`;
      return { success: false, error: description };
    }
    return { success: true, data: json as T };
  } catch (err) {
    console.error(`[cardcom] ${path} threw:`, err);
    return { success: false, error: "CardCom request failed" };
  }
}

interface CreateLowProfileParams {
  /** Amount in agorot? No — CardCom takes shekels with decimal. */
  amount: number;
  /** Our internal reference (we pass the booking id). Echoed back. */
  returnValue: string;
  productName: string;
  successRedirectUrl: string;
  failedRedirectUrl: string;
  webHookUrl: string;
  /** "CreateTokenOnly" for our flow (charge on approval). "ChargeAndCreateToken" if charging immediately. */
  operation?: "ChargeAndCreateToken" | "CreateTokenOnly" | "Charge";
  /** Optional customer details for the invoice */
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

interface LowProfileCreateResponse {
  LowProfileId: string;
  Url: string;
}

export async function createLowProfile(
  params: CreateLowProfileParams
): Promise<CardcomResult<{ lowProfileId: string; url: string }>> {
  const cfg = requireConfig();
  const body: Record<string, unknown> = {
    TerminalNumber: cfg.terminal,
    ApiName: cfg.apiName,
    ReturnValue: params.returnValue,
    Amount: params.amount,
    ProductName: params.productName,
    Language: "he",
    ISOCoinId: 1, // ILS
    SuccessRedirectUrl: params.successRedirectUrl,
    FailedRedirectUrl: params.failedRedirectUrl,
    WebHookUrl: params.webHookUrl,
    Operation: params.operation ?? "CreateTokenOnly",
  };
  if (params.customer) {
    body.UIDefinition = {
      CustomerName: params.customer.fullName,
      CustomerEmail: params.customer.email,
      CustomerPhone: params.customer.phone,
    };
  }
  const result = await postJson<LowProfileCreateResponse>("/LowProfile/Create", body);
  if (!result.success) return result;
  return {
    success: true,
    data: {
      lowProfileId: result.data.LowProfileId,
      url: result.data.Url,
    },
  };
}

interface LowProfileGetResultResponse {
  TranzactionId?: number;
  TokenInfo?: {
    Token: string;
    TokenExDate?: string;
    CardOwnerEmail?: string;
  };
  ReturnValue: string;
}

/**
 * Fetch the result of a Low Profile session. Called from the success
 * redirect handler to verify what CardCom claims, server-side.
 */
export async function getLowProfileResult(
  lowProfileId: string
): Promise<CardcomResult<{ token?: string; transactionId?: string; returnValue: string }>> {
  const cfg = requireConfig();
  const result = await postJson<LowProfileGetResultResponse>("/LowProfile/GetLpResult", {
    TerminalNumber: cfg.terminal,
    ApiName: cfg.apiName,
    LowProfileId: lowProfileId,
  });
  if (!result.success) return result;
  return {
    success: true,
    data: {
      token: result.data.TokenInfo?.Token,
      transactionId: result.data.TranzactionId ? String(result.data.TranzactionId) : undefined,
      returnValue: result.data.ReturnValue,
    },
  };
}

interface ChargeTokenParams {
  /** Token previously captured via Low Profile */
  token: string;
  amount: number;
  /** Our internal reference (booking id) */
  returnValue: string;
  productName: string;
  /** If true, ask CardCom to auto-issue a tax invoice */
  createInvoice?: boolean;
  customer?: { fullName?: string; email?: string };
}

interface ChargeTokenResponse {
  TranzactionId: number;
  ConfirmationNumber?: string;
}

export async function chargeToken(
  params: ChargeTokenParams
): Promise<CardcomResult<{ transactionId: string }>> {
  const cfg = requireConfig();
  const body: Record<string, unknown> = {
    TerminalNumber: cfg.terminal,
    ApiName: cfg.apiName,
    ApiPassword: cfg.apiPassword,
    TokenToCharge: {
      Token: params.token,
      Amount: params.amount,
    },
    ReturnValue: params.returnValue,
    ProductName: params.productName,
    ISOCoinId: 1,
  };
  if (params.createInvoice) {
    body.Document = {
      DocumentTypeToCreate: "TaxInvoiceAndReceipt",
      Name: params.customer?.fullName,
      Email: params.customer?.email,
      Language: "he",
      Products: [
        { Description: params.productName, UnitCost: params.amount, Quantity: 1 },
      ],
    };
  }
  const result = await postJson<ChargeTokenResponse>("/Transactions/Transaction", body);
  if (!result.success) return result;
  return { success: true, data: { transactionId: String(result.data.TranzactionId) } };
}

/**
 * Refund a previous transaction. If amount is omitted, refunds in full.
 */
export async function refundTransaction(params: {
  transactionId: string;
  amount?: number;
}): Promise<CardcomResult<{ refundTransactionId: string }>> {
  const cfg = requireConfig();
  const body: Record<string, unknown> = {
    TerminalNumber: cfg.terminal,
    ApiName: cfg.apiName,
    ApiPassword: cfg.apiPassword,
    TranzactionId: Number(params.transactionId),
  };
  if (params.amount !== undefined) body.PartialSum = params.amount;
  const result = await postJson<{ TranzactionId: number }>("/Transactions/RefundByTransactionId", body);
  if (!result.success) return result;
  return { success: true, data: { refundTransactionId: String(result.data.TranzactionId) } };
}
