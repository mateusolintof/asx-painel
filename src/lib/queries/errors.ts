interface QueryErrorLike {
  message: string
}

export function throwQueryError(context: string, error: QueryErrorLike | null) {
  if (!error) return

  throw new Error(`${context}: ${error.message}`)
}
