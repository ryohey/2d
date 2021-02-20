import { configureStore } from "@reduxjs/toolkit"
import { codeSlice } from "./CodeStore"
import { graphSlice } from "./GraphStore"

export const store = configureStore({
  reducer: {
    codes: codeSlice.reducer,
    graph: graphSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
