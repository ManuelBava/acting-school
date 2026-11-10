import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { fetchAdminMembership, fetchProfile } from '../lib/data.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [adminCheckedFor, setAdminCheckedFor] = useState(null)
  const [profileVersion, setProfileVersion] = useState(0)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setSession(null)
        setLoading(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null)
        setLoading(false)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsAdmin(false)
      setProfileLoading(false)
      setAdminCheckedFor(null)
      return undefined
    }

    let active = true
    setProfileLoading(true)

    Promise.all([
      fetchProfile(userId),
      fetchAdminMembership(userId).catch(() => false),
    ])
      .then(([nextProfile, admin]) => {
        if (!active) return
        setProfile(nextProfile)
        setIsAdmin(admin)
        setProfileLoading(false)
        setAdminCheckedFor(userId)
      })
      .catch(() => {
        if (!active) return
        setProfile(null)
        setIsAdmin(false)
        setProfileLoading(false)
        setAdminCheckedFor(userId)
      })

    return () => {
      active = false
    }
  }, [userId, profileVersion])

  const reloadProfile = useCallback(() => {
    setProfileVersion((version) => version + 1)
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      loading,
      profileLoading,
      adminLoading: Boolean(userId) && adminCheckedFor !== userId,
      reloadProfile,
      signOut,
    }),
    [
      session,
      userId,
      profile,
      isAdmin,
      loading,
      profileLoading,
      adminCheckedFor,
      reloadProfile,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
