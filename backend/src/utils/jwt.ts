import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;   // user id
  role: string;
}

const secret = (): string => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET missing");
  return s;
};

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, secret(), { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, secret()) as JwtPayload;