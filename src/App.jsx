
import { useEffect, useState } from 'react'
import './style.css'
import { supabase } from './lib/supabase'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return

      if (error) setStatus(error.message)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    let active = true

    async function loadWorkspace() {
      setStatus('در حال بررسی فضای کاری...')

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('display_name, tenant_id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (profileError) {
        setStatus(`خطای دریافت حساب: ${profileError.message}`)
        return
      }

      if (!profile) {
        setStatus('برای این حساب، پروفایل فضای کاری پیدا نشد.')
        return
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', profile.tenant_id)
        .maybeSingle()

      if (!active) return

      if (workspaceError) {
        setStatus(`خطای دریافت فضای کاری: ${workspaceError.message}`)
        return
      }

      if (!workspace) {
        setStatus('فضای کاری پیدا نشد یا دسترسی خواندن آن مجاز نیست.')
        return
      }

      setStatus(
        `ورود موفق | کاربر: ${profile.display_name} | فضای کاری: ${workspace.name}`
      )
    }

    loadWorkspace()

    return () => {
      active = false
    }
  }, [user])

  async function signIn(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('در حال ورود...')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setStatus(`ورود ناموفق بود: ${error.message}`)
      } else {
        setStatus('ورود انجام شد؛ در حال بررسی دسترسی‌ها...')
        setPassword('')
      }
    } catch (error) {
      setStatus(`خطا: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function signOut() {
    setSubmitting(true)

    const { error } = await supabase.auth.signOut()

    setStatus(
      error ? `خطای خروج: ${error.message}` : 'از حساب خارج شدی.'
    )

    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="app">
        <section className="hero">
          <h1>علی نوین</h1>
          <p>در حال بررسی نشست کاربر...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">
          ALI NOVIN • REAL-ESTATE INTELLIGENCE
        </p>

        <h1>علی نوین</h1>

        <p className="subtitle">
          سیستم املاک مبتنی بر علم، شواهد، حافظه و یادگیری
        </p>

        {user ? (
          <>
            <p>حساب واردشده: {user.email}</p>
            <p role="status">{status}</p>

            <button onClick={signOut} disabled={submitting}>
              {submitting ? 'لطفاً صبر کن...' : 'خروج از حساب'}
            </button>
          </>
        ) : (
          <form onSubmit={signIn}>
            <label htmlFor="email">ایمیل حساب</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ایمیل حساب تأییدشده"
              required
            />

            <label htmlFor="password">رمز عبور</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="رمز عبور حساب"
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'در حال ورود...' : 'ورود به علی نوین'}
            </button>

            <p role="status">{status}</p>
          </form>
        )}
      </section>
    </main>
  )
}

export default App
