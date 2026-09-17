import { ApiResponse } from './api-responses';
export interface ErrorMsg {
  error?: string;
}

export function translateError<T>(resp: ApiResponse<T>): ErrorMsg {
  if (!resp.error) {
    return {};
  } else {
    if (resp.statusCode && resp.error) {
      if (resp.statusCode >= 400 && resp.statusCode < 500) {
        return { error: resp.error };
      } else {
        return { error: 'Something went wrong on the server.' };
      }
    } else {
      return { error: 'Unknown failure, this is not meant to happen.' };
    }
  }
}
