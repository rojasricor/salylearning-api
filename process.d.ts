declare namespace NodeJS {
  export interface ProcessEnv {
    JWTSECRET?: string;
    JWTEXPIRESIN?: string;
  }
}
