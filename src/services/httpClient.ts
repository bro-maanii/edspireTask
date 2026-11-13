import { ApiError, type ApiErrorKind } from '../types/apiError'

export interface FetchJsonOptions {
  signal?: AbortSignal
  /** Human-readable description of the action, used in error messages, e.g. "search for cities". */
  context: string
  headers?: Record<string, string>
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, { signal: options.signal, headers: options.headers })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('network', options.context, { cause: error })
  }

  if (!response.ok) {
    throw new ApiError(statusToKind(response.status), options.context, { cause: response.status })
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    throw new ApiError('unknown', options.context, { cause: error })
  }
}

function statusToKind(status: number): ApiErrorKind {
  if (status === 429) return 'rate_limit'
  if (status === 401 || status === 403) return 'auth'
  if (status === 404) return 'not_found'
  return 'unknown'
}
