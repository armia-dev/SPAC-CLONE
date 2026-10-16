import { useState } from 'react';
import bgimg from './assets/AdminLoginBG.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your staff email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(cleanEmail);
      if (res.success) {
        navigate('/check-email', { state: { email: cleanEmail } });
      } else {
        setError(res.error || 'Unable to process recovery request.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 'clamp(380px, 26vw, 460px)',
          backgroundColor: 'white',
          border: '1px solid #D4C9A8',
          borderRadius: 8,
          padding: 'clamp(22px, 1.8vw, 30px)',
          boxSizing: 'border-box',
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: 0,
            paddingBottom: 6,
            fontSize: 'clamp(18px, 1.3vw, 22px)',
            fontWeight: 800,
            color: '#121212',
            textTransform: 'uppercase',
            borderBottom: '1px solid #999',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          Forgot Password?
        </h1>

        {/* Description / confirmation */}
        <p style={{ margin: '12px 0 20px', fontSize: 13, lineHeight: 1.5, color: '#666' }}>
          Enter your staff email. If it matches an account on the system, we'll send a password reset link to it.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <label
          htmlFor="reset-email"
          style={{ display: 'block', fontSize: 14, color: '#121212', marginBottom: 8 }}
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
            marginBottom: 24,
          }}
        >
          <input
            id="reset-email"
            type="email"
            value={email}
            disabled={isSubmitting}
            autoComplete="email"
            placeholder="e.g. staff@saranay.ph"
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: 44,
            backgroundColor: isSubmitting ? '#e2ff66' : '#CCFF00',
            color: '#000',
            border: '1px solid #000',
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
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
              <span>Sending link...</span>
            </>
          ) : (
            <span>Send reset link</span>
          )}
        </button>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 13,
              color: '#222',
            }}
          >
            ← Back to Sign in
          </button>
        </div>
      </form>
    </div>
  );
}