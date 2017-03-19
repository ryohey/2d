import React from "react"

import f from "./helpers/flatJoin"
import e from "./helpers/getElementType"

import "./Icon.css"
import "mdi/css/materialdesignicons.css"

export default function Icon({ component, name, className }) {
  const ElementType = e(component)
  return <ElementType
    className={f("Icon", "mdi", `mdi-${name}`, className)}
  />
}
