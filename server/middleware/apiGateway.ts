import { Request, Response, NextFunction } from "express";

export function apiGateway(req: Request, res: Response, next: NextFunction) {
  console.log(`[API GATEWAY] Ingress request: ${req.method} ${req.url}`);
  next();
}

export default apiGateway;
