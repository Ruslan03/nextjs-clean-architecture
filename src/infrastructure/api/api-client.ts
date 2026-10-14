/**
 * INFRASTRUCTURE LAYER — Centralized API Client
 *
 * Encapsulates technical network details: fetch execution, error normalization, and JSON parsing.
 * Contains no business logic.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string
  ) {
    super(`API Error ${status} ${statusText} — ${url}`)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Optional timeout in milliseconds */
  timeout?: number
  body?: unknown
}

async function request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { timeout, body, headers, signal, ...rest } = options

  const controller = timeout ? new AbortController() : null
  const timeoutId = timeout ? setTimeout(() => controller?.abort(), timeout) : null

  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ?? controller?.signal,
    })

    if (!res.ok) {
      throw new ApiError(res.status, res.statusText, url)
    }

    if (res.status === 204) return undefined as T

    return (await res.json()) as T
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export const apiClient = {
  get: <T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'POST', body }),
}
