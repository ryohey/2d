import { getParamNames } from "./functionHelper"

export default function () {
  const codes = [
    {
      code: `() => "Hello"`,
      name: "helloStr",
    },
    {
      code: `msg => console.log(msg)`,
      name: "log",
    },
    {
      code: `msg => alert(msg)`,
      name: "alert",
    },
    {
      code: `url => fetch(url)`,
      name: "fetch",
      isAsync: true,
    },
  ]

  return codes.map((c) => {
    const func = eval(`() => { return ${c.code} }`)()
    return {
      ...c,
      inputNames: getParamNames(func),
    }
  })
}
