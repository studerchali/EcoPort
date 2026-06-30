/**
 * Sesión Supabase Auth: email, OAuth (Google/Apple) y signOut global.
 * FinanceStoreSync (main.tsx) reacciona a cambios de user para aislar datos por cuenta.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (
    provider: 'google' | 'apple'
  ) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return { error }
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { error }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    return { error }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      resetPassword,
      signOut,
    }),
    [
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      resetPassword,
      signOut,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}