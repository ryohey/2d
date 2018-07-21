export function createFunction(code: string): Function {
  return eval(`() => { return ${code} }`)()
}
