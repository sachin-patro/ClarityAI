'use client'

import { useEffect } from 'react'
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function Auth() {
  const router = useRouter()

  // For development purposes, provide a direct way to bypass auth
  const skipAuth = () => {
    router.push('/')
  }

  useEffect(() => {
    // DEVELOPMENT ONLY: Uncomment this section when ready to implement auth
    /*
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Create user in our database
        fetch('/api/auth/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: session?.user.id,
            email: session?.user.email,
          }),
        })
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    */
  }, [router])

  return (
    <div className="w-full">
      {/* DEVELOPMENT ONLY: Skip auth button */}
      <button 
        onClick={skipAuth}
        className="w-full py-2 px-4 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
      >
        Skip Authentication (Development Only)
      </button>

      {/* DEVELOPMENT ONLY: Uncomment this section when ready to implement auth */}
      {/*
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo={`${window.location.origin}/auth/callback`}
      />
      */}
    </div>
  )
} 