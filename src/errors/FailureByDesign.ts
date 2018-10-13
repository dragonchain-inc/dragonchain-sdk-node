export class FailureByDesign extends Error {
  code: string
  message: string

  constructor (code: string, message: string) {
    super(message)
    this.code = code || 'FAILURE_BY_DESIGN'
    this.message = message || 'Failure By Design'
  }
}
