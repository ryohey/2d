import { atom } from "recoil"
import exampleCodes from "../helpers/exampleCodes"

export interface Code {
  code: string
  name: string
  inputNames: string[]
}

export const codeState = atom<Code[]>({
  key: "codeState",
  default: exampleCodes(),
})
