import { observable, makeObservable } from "mobx";

export interface Code {
  code: string
  name: string
  inputNames: string[]
}

export class CodeStore {
  codes: Code[] = [];

  constructor() {
    makeObservable(this, {
      codes: observable
    });
  }
}
