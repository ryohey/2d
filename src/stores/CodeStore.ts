import { observable } from "mobx"

export interface Code {
  code: string
  name: string
  inputNames: string[]
}

export class CodeStore {
  @observable codes: Code[] = []
}
