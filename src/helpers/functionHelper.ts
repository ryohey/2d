export function createFunction(code: string): Function {
  return eval(`() => { return ${code} }`)()
}

// https://stackoverflow.com/a/9924463/1567777
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm
const ARGUMENT_NAMES = /([^\s,]+)/g
export function getParamNames(func: Function): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, "")
  const result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .match(ARGUMENT_NAMES)
  return result === null ? [] : result
}
