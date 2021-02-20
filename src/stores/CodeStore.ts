import { createSlice } from "@reduxjs/toolkit"
import exampleCodes from "../helpers/exampleCodes"

export interface Code {
  code: string
  name: string
  inputNames: string[]
}

export const codeSlice = createSlice({
  name: "code",
  initialState: exampleCodes() as Code[],
  reducers: {},
})
