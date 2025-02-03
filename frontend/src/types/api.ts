export interface ApiErrorData {
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface ApiError {
  response?: {
    status?: number;
    data?: ApiErrorData;
  };
  message: string;
}