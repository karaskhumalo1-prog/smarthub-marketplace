import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null) // { id, role, created_at }
  const [vendor, setVendor] = useState(null) // vendor row if role === 'vendor'
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(profileData || null)

    if (profileData?.role === 'vendor') {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', userId)
        .single()
      setVendor(vendorData || null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        setVendor(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user || null,
    profile,
    vendor,
    role: profile?.role || null,
    loading,
    signOut,
    refreshProfile: () => session?.user && loadProfile(session.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
