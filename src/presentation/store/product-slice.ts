/**
 * PRESENTATION LAYER — Redux Visitor Slice
 *
 * Manages visitor session state (Name, City, Delivery Address) in the client presentation layer.
 * Keeps domain and use-case layers 100% agnostic of UI state management.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PaginationList {
    page: number
}

const initialState: any = {
    productList: {
        page: 1
    }
}

export const productSlice = createSlice({
    name: 'product-list',
    initialState,
    reducers: {
        addPage: (
            state
        ) => {
            state.productList.page = state.productList.page + 1
        }
    },
})

export const { addPage } =
    productSlice.actions

export const productReducer = productSlice.reducer
export default productSlice.reducer

