import { observable } from "mobx"

interface Code {
  code: string
  name: string
  inputNames: string[]
}

export class CodeStore {
  @observable codes: Code[] = []
}
