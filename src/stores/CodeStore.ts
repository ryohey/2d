import { observable } from "mobx"

export default class CodeStore {
  @observable codes: any[] = []
}
