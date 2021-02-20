import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { RecoilRoot } from "recoil"
import { App } from "./containers/App"
import "./index.css"
import { store } from "./stores/store"

ReactDOM.render(
  <Provider store={store}>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </Provider>,
  document.getElementById("root")
)
