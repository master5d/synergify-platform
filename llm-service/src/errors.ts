export type LlmErrorCode =
  | 'gateway_unreachable' | 'gateway_error' | 'unparsable' | 'bad_shape' | 'timeout'

export class LlmError extends Error {
  constructor(public readonly code: LlmErrorCode, message: string) {
    super(message)
    this.name = 'LlmError'
  }
}

/** Ошибка ВЫЗЫВАЮЩЕГО (HTTP 400), а не апстрима. Живёт здесь, а не в index.ts:
 *  её бросают и обработчики (prose.ts), а импортировать из точки входа — цикл. */
export class BadRequestError extends Error {}
