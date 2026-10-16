import logo from "./assets/LogoBG.png";
import bgimg from "./assets/AdminLoginBG.png";
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, role, authError, setAuthError, isConfigured } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      if (role === 'Customer') {
        navigate('/customer', { replace: true });
      } else {
        const dest = location.state?.from?.pathname || '/';
        navigate(dest, { replace: true });
      }
    }
  }, [user, role, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(cleanEmail, password);
      if (res.success) {
        if (res.role === 'Customer') {
          navigate('/customer', { replace: true });
        } else {
          const dest = location.state?.from?.pathname || '/';
          navigate(dest, { replace: true });
        }
      } else {
        setFormError(res.error || 'Failed to sign in.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError || authError;

  return (
    <div
      style={{
        backgroundImage: `url(${bgimg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div
        className="bg-olive-50"
        style={{
          width: '100%',
          minHeight: '58vh',
          maxWidth: 'clamp(420px, 28vw, 520px)',
          border: '1px solid #D4C9A8',
          borderRadius: 8,
          padding: 'clamp(18px, 1.6vw, 28px)',
          boxSizing: 'border-box',
          paddingBottom: 24,
          backgroundColor: '#FBFBF9',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            userSelect: 'none',
          }}
        >
          <img src={logo} alt="Saranay Pickleball Court" style={{ width: '95%' }} />
          <p
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: 'clamp(22px, 1.6vw, 30px)',
              fontWeight: 800,
              margin: 0,
              cursor: 'default',
              userSelect: 'none',
              color: '#121212',
            }}
          >
            Management Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 12px', marginTop: 'clamp(16px, 2vh, 24px)' }}>
          {/* Error Banner */}
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{displayError}</span>
            </div>
          )}

          {!isConfigured && (
            <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              <span className="font-bold">Preview Mode:</span> Demo staff accounts available: <code className="font-mono font-semibold">admin@saranay.ph</code>, <code className="font-mono font-semibold">manager@saranay.ph</code>, <code className="font-mono font-semibold">staff@saranay.ph</code>, <code className="font-mono font-semibold">cashier@saranay.ph</code> (any password).
            </div>
          )}

          <label
            htmlFor="login-email"
            style={{ cursor: 'default', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 14, color: '#121212', display: 'block', marginBottom: 6 }}
          >
            Email Address
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #D4C9A8',
              borderRadius: 14,
              padding: '0 16px',
              height: 47,
              boxSizing: 'border-box',
              backgroundColor: 'white',
              marginBottom: 18,
            }}
          >
            <input
              id="login-email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
              placeholder="e.g. staff@saranay.ph"
              disabled={isSubmitting}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: 15,
                fontFamily: 'inherit',
                background: 'transparent',
              }}
            />
          </div>

          <label
            htmlFor="login-password"
            style={{ cursor: 'default', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 14, color: '#121212', display: 'block', marginBottom: 6 }}
          >
            Password
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #D4C9A8',
              borderRadius: 14,
              padding: '0 16px',
              height: 47,
              boxSizing: 'border-box',
              backgroundColor: 'white',
            }}
          >
            <input
              id="login-password"
              ref={passwordRef}
              type={show ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError('');
              }}
              disabled={isSubmitting}
              placeholder="Enter your password"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: 15,
                fontFamily: 'inherit',
                background: 'transparent',
              }}
            />

            {/* eye toggle */}
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
                {show && <line x1="3" y1="3" x2="21" y2="21" />}
              </svg>
            </button>
          </div>

          {/* forgot password link */}
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ cursor: 'pointer', color: '#222', fontSize: 14, textDecoration: 'none', border: 'none', background: 'none' }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 42,
              backgroundColor: isSubmitting ? '#e2ff66' : '#CCFF00',
              color: '#000',
              border: '2px solid #000',
              borderRadius: 10,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: 'clamp(18px, 2.5vh, 26px)',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}