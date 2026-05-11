import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

export default function auth(req: any, res: any, next: any) {
  let token = req.headers.authorization;
  
  if (token?.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    console.error("Auth Failure: No token provided");
    return res.status(401).json({
      error: "No token admitted",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error("Auth Failure: Invalid token", err.message);
    return res.status(401).json({
      error: "Invalid token",
      details: err.message
    });
  }
}
