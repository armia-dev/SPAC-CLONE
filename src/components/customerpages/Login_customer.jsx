import { useState, useEffect, useRef } from 'react'
import logo from '/src/assets/Logo2.png'

export default function Login_customer({ onClose, onForgot, onSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call your customer login API here
    console.log('sign in', email)
  }

  const linkBtn = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    color: '#121212',
  }

  const boxStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #D4C9A8',
    borderRadius: 8,
    padding: '0 14px',
    height: 44,
    boxSizing: 'border-box',
    backgroundColor: 'white',
  }

  const inputStyle = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    background: 'transparent',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    color: '#121212',
    marginBottom: 6,
  }

    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    const prevPad = body.style.paddingRight

    // keep the layout from jumping when the scrollbar disappears
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    const onKey = (e) => e.key === 'Escape' && onCloseRef.current?.()
    window.addEventListener('keydown', onKey)

    return () => {
        html.style.overflow = prevHtml
        body.style.overflow = prevBody
        body.style.paddingRight = prevPad
        window.removeEventListener('keydown', onKey)
    }
    }, [])
    
  return (
    // backdrop: clicking outside the card closes it
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,          
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}   // clicks inside the card don't close it
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: 12,
          padding: '28px 24px 22px',
          boxSizing: 'border-box',
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ ...linkBtn, position: 'absolute', top: 14, right: 14, display: 'flex' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
        </button>

        {/* Logo + title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            paddingBottom: 10,
            borderBottom: '1px solid #444',
          }}
        >
          <img src={logo} alt="Saranay Pickleball Court" style={{ width: 90, maxWidth: '40%' }} />
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: '#121212',
              textTransform: 'uppercase',
            }}
          >
            Welcome back
          </h1>
        </div>

        <p style={{ margin: '10px 0 18px', fontSize: 12, lineHeight: 1.4, color: '#666', maxWidth: 190 }}>
          Enter your credentials to access your account.
        </p>

        {/* Email */}
        <label htmlFor="customer-email" style={labelStyle}>Email Address</label>
        <div style={{ ...boxStyle, marginBottom: 18 }}>
          <input
            id="customer-email"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <label htmlFor="customer-password" style={labelStyle}>Password</label>
        <div style={boxStyle}>
          <input
            id="customer-password"
            type={show ? 'text' : 'password'}
            placeholder="enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{ ...linkBtn, display: 'flex' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
              {show && <line x1="3" y1="3" x2="21" y2="21" />}
            </svg>
          </button>
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginTop: 6 }}>
          <button type="button" onClick={onForgot} style={{ ...linkBtn, fontSize: 12 }}>
            Forgot password?
          </button>
        </div>

        {/* Sign in */}
        <button
          type="submit"
          style={{
            width: '100%',
            height: 40,
            marginTop: 22,
            backgroundColor: '#CCFF00',
            color: '#000',
            border: '1px solid #000',
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>

        {/* Sign up */}
        <p style={{ margin: '18px 0 0', textAlign: 'center', fontSize: 12, color: '#121212' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSignUp} style={{ ...linkBtn, fontSize: 12, textDecoration: 'underline' }}>
            Sign up
          </button>
        </p>
      </form>
    </div>
  )
}