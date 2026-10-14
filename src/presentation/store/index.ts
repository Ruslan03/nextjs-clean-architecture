/**
 * PRESENTATION LAYER — Redux Store Configuration & Typed Hooks
 *
 * Configures the Redux store for client presentation components.
 */

import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import visitorReducer from './visitor-slice'
import { productReducer } from './product-slice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      visitor: visitorReducer,
      product: productReducer
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
