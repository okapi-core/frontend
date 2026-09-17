export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (res.ok) {
    // Handle empty bodies gracefully to avoid JSON parse errors
    const text = await res.text();
    if (!text) {
      return { data: {} as T };
    }
    try {
      const data = JSON.parse(text) as T;
      return { data };
    } catch {
      // If the body isn't valid JSON but response is ok, surface an empty object
      return { data: {} as T };
    }
  } else {
    const errorData = await res.text();
    return {
      error: errorData,
      statusCode: res.status,
    };
  }
}

export function checkIfRequestFailed(res: ApiResponse<unknown>): boolean {
  return !!res.error || (res.statusCode !== undefined && res.statusCode >= 400);
}

export function checkIfRequestIsSuccessful(res: ApiResponse<unknown>): boolean {
  return !res.error && (res.statusCode === undefined || res.statusCode < 400);
}
