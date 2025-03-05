export interface ApiResponse<T> {
  data?: T;
  errorCode?: string;
  errorMessage?: string;
  success: boolean;
  timestamp: Date;
}
