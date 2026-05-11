export default function admin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin only",
    });
  }

  next();
}
