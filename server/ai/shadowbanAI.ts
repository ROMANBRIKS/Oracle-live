export interface ShadowbanParams {
  reports: number;
  toxicity: boolean;
  spam: boolean;
}

export function shouldShadowban({
  reports,
  toxicity,
  spam,
}: ShadowbanParams): boolean {
  return (reports || 0) > 10 && toxicity && spam;
}
