/**
 * PRESENTATION LAYER — Redux Visitor Slice
 *
 * Manages visitor session state (Name, City, Delivery Address) in the client presentation layer.
 * Keeps domain and use-case layers 100% agnostic of UI state management.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface VisitorProfile {
  name: string
  cityId: string
  cityName: string
  address: string
  isConfigured: boolean
}

export interface VisitorState {
  profile: VisitorProfile
  isModalOpen: boolean
  isHydrated: boolean
}

const initialState: VisitorState = {
  profile: {
    name: '',
    cityId: 'JKT-01',
    cityName: 'Jakarta Pusat',
    address: '',
    isConfigured: false,
  },
  isModalOpen: false,
  isHydrated: false,
}

export const visitorSlice = createSlice({
  name: 'visitor',
  initialState,
  reducers: {
    setVisitorProfile: (
      state,
      action: PayloadAction<{
        name: string
        cityId: string
        cityName: string
        address: string
      }>
    ) => {
      state.profile = {
        name: action.payload.name.trim(),
        cityId: action.payload.cityId,
        cityName: action.payload.cityName,
        address: action.payload.address.trim(),
        isConfigured: true,
      }
      state.isModalOpen = false
    },
    openVisitorModal: (state) => {
      state.isModalOpen = true
    },
    closeVisitorModal: (state) => {
      state.isModalOpen = false
    },
    hydrateVisitor: (
      state,
      action: PayloadAction<{ profile: VisitorProfile | null }>
    ) => {
      state.isHydrated = true
      if (action.payload.profile && action.payload.profile.isConfigured) {
        state.profile = action.payload.profile
        state.isModalOpen = false
      } else {
        // First visit: automatically open the modal to ask for visitor details
        state.isModalOpen = true
      }
    },
  },
})

export const { setVisitorProfile, openVisitorModal, closeVisitorModal, hydrateVisitor } =
  visitorSlice.actions

export const visitorReducer = visitorSlice.reducer
export default visitorSlice.reducer

