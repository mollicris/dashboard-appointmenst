interface JwtClaims {
  sub: string;
  tenant_id: string;
  role: string;
  email: string;
  exp: number;
}

export function decodeJwt(token: string): JwtClaims {
  const base64 = (token.split(".")[1] ?? "").replaceAll("-", "+").replaceAll("_", "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
  );
  return JSON.parse(json) as JwtClaims;
}
