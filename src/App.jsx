

import { useState } from 'react'
import './style.css'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('آماده آزمایش')
  const [loading, setLoading] = useState(false)

  async function testConnection() {
    setLoading(true)
    setStatus('در حال بررسی اتصال...')

    try {
      const { error } = await supabase
        .from('connection_test')
        .select('*')
        .limit(1)

      if (error) {
        setStatus(`پاسخ Supabase: ${error.message}`)
      } else {
        setStatus('درخواست به Supabase موفق بود.')
      }
    } catch (error) {
      setStatus(`خطا: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">ALI NOVIN • REAL-ESTATE INTELLIGENCE</p>
        <h1>علی نوین</h1>
        <p className="subtitle">
          سیستم املاک مبتنی بر علم، شواهد، حافظه و یادگیری
        </p>

        <button onClick={testConnection} disabled={loading}>
          {loading ? 'در حال آزمایش...' : 'آزمایش اتصال به پایگاه داده'}
        </button>

        <p role="status">{status}</p>
      </section>
    </main>
  )
}

export default App
