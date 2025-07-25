declare module 'jwt-decode' {
  export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string[] | string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }

  export class InvalidTokenError extends Error {}

  export function jwtDecode<T = JwtPayload>(
    token: string,
    options?: {
      header?: boolean;
    }
  ): T;
}