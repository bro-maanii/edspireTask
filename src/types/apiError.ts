export type ApiErrorKind = 'network' | 'rate_limit' | 'not_found' | 'auth' | 'unknown'

interface ErrorCopy {
  message: string
  action: string
}

const ERROR_COPY: Record<ApiErrorKind, (context: string) => ErrorCopy> = {
  network: (context) => ({
    message: `Couldn't reach the network while trying to ${context}.`,
    action: 'Check your internet connection and try again.',
  }),
  rate_limit: (context) => ({
    message: `Too many requests while trying to ${context}.`,
    action: 'Wait a few seconds, then try again.',
  }),
  not_found: (context) => ({
    message: `Nothing was found while trying to ${context}.`,
    action: 'Double-check the spelling or try a different search.',
  }),
  auth: (context) => ({
    message: `The request to ${context} was rejected because the API key is missing or invalid.`,
    action: 'Add a valid key to .env (see .env.example) and restart the dev server.',
  }),
  unknown: (context) => ({
    message: `Something unexpected happened while trying to ${context}.`,
    action: 'Try again in a moment. If it keeps happening, check the browser console for details.',
  }),
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly action: string

  constructor(kind: ApiErrorKind, context: string, options?: { cause?: unknown }) {
    const { message, action } = ERROR_COPY[kind](context)
    super(message, options?.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.action = action
  }
}
