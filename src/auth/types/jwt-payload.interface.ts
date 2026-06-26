export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  userId: string;
  name: string;
  jti: string;
}
