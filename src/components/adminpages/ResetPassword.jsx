import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgimg from './assets/AdminLoginBG.png';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

function PasswordInput({ placeholder, value, onChange, disabled }) {
  const [show, setShow] = useState(false);

  return (
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
        marginBottom: 14,
      }}
    >
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          fontSize: 14,
          fontFamily: 'inherit',
          background: 'transparent',
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
      >
        {show ? (
          <EyeOff className="w-5 h-5 text-neutral-600" />
        ) : (
          <Eye className="w-5 h-5 text-neutral-600" />
        )}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(password);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1800);
      } else {
        setError(res.error || 'Failed to update password. Recovery link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resetting your password.');
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
          Reset Password
        </h1>

        <p style={{ margin: '12px 0 20px', fontSize: 13, lineHeight: 1.5, color: '#666' }}>
          Choose a secure new password for your staff management account.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Password updated successfully! Redirecting to login...</span>
          </div>
        )}

        <label style={{ display: 'block', fontSize: 14, color: '#121212', marginBottom: 6 }}>
          New Password
        </label>
        <PasswordInput
          placeholder="At least 8 characters"
          value={password}
          disabled={isSubmitting || isSuccess}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
        />

        <label style={{ display: 'block', fontSize: 14, color: '#121212', marginBottom: 6 }}>
          Confirm New Password
        </label>
        <PasswordInput
          placeholder="Re-enter password"
          value={confirm}
          disabled={isSubmitting || isSuccess}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError('');
          }}
        />

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          style={{
            width: '100%',
            height: 44,
            backgroundColor: isSubmitting || isSuccess ? '#e2ff66' : '#CCFF00',
            color: '#000',
            border: '1px solid #000',
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: isSubmitting || isSuccess ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>

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