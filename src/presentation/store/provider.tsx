'use client'

/**
 * PRESENTATION LAYER — Redux Store Provider & LocalStorage Synchronizer
 *
 * Wraps the client application in Redux Provider.
 * Synchronizes visitor state with localStorage ('orbit_visitor_profile') to
 * ensure persistence across page refreshes.
 */

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './index'
import { hydrateVisitor, VisitorProfile } from './visitor-slice'

const STORAGE_KEY = 'orbit_visitor_profile'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  useEffect(() => {
    if (!storeRef.current) return

    // 1. Read from localStorage on initial mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: VisitorProfile = JSON.parse(stored)
        storeRef.current.dispatch(hydrateVisitor({ profile: parsed }))
      } else {
        // First time visitor: triggers modal prompt
        storeRef.current.dispatch(hydrateVisitor({ profile: null }))
      }
    } catch {
      storeRef.current.dispatch(hydrateVisitor({ profile: null }))
    }

    // 2. Subscribe to store changes to sync profile to localStorage
    const unsubscribe = storeRef.current.subscribe(() => {
      const state = storeRef.current?.getState()
      if (state?.visitor.profile.isConfigured) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.visitor.profile))
        } catch {
          // ignore storage quota errors
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
