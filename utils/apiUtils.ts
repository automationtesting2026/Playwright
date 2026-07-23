import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiUtils {
  static async get(request: APIRequestContext, endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return request.get(endpoint, { headers });
  }

  static async post(request: APIRequestContext, endpoint: string, payload: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return request.post(endpoint, { data: payload, headers });
  }

  static async put(request: APIRequestContext, endpoint: string, payload: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return request.put(endpoint, { data: payload, headers });
  }

  static async delete(request: APIRequestContext, endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return request.delete(endpoint, { headers });
  }
}
