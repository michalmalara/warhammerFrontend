export interface TokenObtainPairRequest {
  username: string;
  password: string;
}

export interface TokenPairResponse {
  access: string;
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}
