export interface RouteWithdrawalParams {
  currency: string;
  method: string;
}

export function routeWithdrawal({
  currency,
  method,
}: RouteWithdrawalParams) {
  if (method === "crypto") {
    return {
      provider: "blockchain",
    };
  }

  if (method === "paystack") {
    return {
      provider: "paystack",
    };
  }

  return {
    provider: "mock",
  };
}
