import { useState, useEffect, useRef } from 'react'
import logo from '/src/assets/Logo2.png'

export default function Signup_customer({ onClose, onSignIn }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('') // digits only, 10 max (after +63)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  // "9171234567" -> "917 123 4567"
  const formatMobile = (d) =>
    [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(' ')

  const handleMobile = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(digits)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mobile.length !== 10) return setError('Enter a 10-digit mobile number.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setError('')
    // TODO: call your customer sign-up API here
    console.log('sign up', { fullName, email, mobile: `+63${mobile}` })
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

  const fieldGap = { marginBottom: 16 }

  // lock page scroll + close on Escape
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    const prevPad = body.style.paddingRight

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

  const EyeIcon = ({ off }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  )

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
        overflowY: 'auto', // lets short screens scroll the card instead of clipping it
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          margin: 'auto',
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
            Create an account
          </h1>
        </div>

        <p style={{ margin: '10px 0 18px', fontSize: 12, lineHeight: 1.4, color: '#666' }}>
          Sign up now and get on the court faster.
        </p>

        {/* Full name */}
        <div style={fieldGap}>
          <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
          <div style={boxStyle}>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div style={fieldGap}>
          <label htmlFor="signup-email" style={labelStyle}>Email</label>
          <div style={boxStyle}>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Mobile number */}
        <div style={fieldGap}>
          <label htmlFor="signup-mobile" style={labelStyle}>Mobile Number</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ ...boxStyle, padding: '0 12px', fontSize: 14, flexShrink: 0 }}>+63</div>
            <div style={{ ...boxStyle, flex: 1, minWidth: 0 }}>
              <input
                id="signup-mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="xxx xxx xxxx"
                value={formatMobile(mobile)}
                onChange={handleMobile}
                required
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div style={fieldGap}>
          <label htmlFor="signup-password" style={labelStyle}>Password</label>
          <div style={boxStyle}>
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              style={{ ...linkBtn, display: 'flex' }}
            >
              <EyeIcon off={showPass} />
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="signup-confirm" style={labelStyle}>Confirm Password</label>
          <div style={boxStyle}>
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              style={{ ...linkBtn, display: 'flex' }}
            >
              <EyeIcon off={showConfirm} />
            </button>
          </div>
        </div>

        {/* Validation error */}
        {error && (
          <p role="alert" style={{ margin: '10px 0 0', fontSize: 12, color: '#C62828' }}>
            {error}
          </p>
        )}

        {/* Sign up */}
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
          Sign up
        </button>

        {/* Sign in */}
        <p style={{ margin: '18px 0 0', textAlign: 'center', fontSize: 12, color: '#121212' }}>
          Already have an account?{' '}
          <button type="button" onClick={onSignIn} style={{ ...linkBtn, fontSize: 12, textDecoration: 'underline' }}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}