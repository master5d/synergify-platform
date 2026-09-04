export type LlmErrorCode =
  | 'gateway_unreachable' | 'gateway_error' | 'unparsable' | 'bad_shape' | 'timeout'

export class LlmError extends Error {
  constructor(public readonly code: LlmErrorCode, message: string) {
    super(message)
    this.name = 'LlmError'
  }
}
