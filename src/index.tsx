import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { App } from "./containers/App"
import "./index.css"
import { store } from "./stores/store"

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
)
