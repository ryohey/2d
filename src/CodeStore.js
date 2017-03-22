import { extendObservable, action, } from "mobx"
import _ from "lodash"

export default class CodeStore { constructor() { extendObservable(this, {
  codes: []
})}}
