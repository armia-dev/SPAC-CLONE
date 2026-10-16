import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgimg from './assets/AdminLoginBG.png';
import { useAuth } from '../../context/AuthContext';
import { Mail, CheckCircle2 } from 'lucide-react';

const maskEmail = (email = '') => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}*@${domain}`;
};

export default function CheckEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email ?? '';
  const { requestPasswordReset } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [resentMessage, setResentMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    await requestPasswordReset(email);
    setResentMessage(true);
    setCooldown(60); // 60 seconds cooldown to prevent abuse
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
      <div
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
          }}
        >
          Check your email
        </h1>

        {/* Envelope icon */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 18px' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#CCFF00',
              border: '3px solid #121212',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <Mail className="w-7 h-7 text-[#121212] stroke-[2]" />
          </div>
        </div>

        {resentMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Reset link resent. Please check your inbox.</span>
          </div>
        )}

        <p style={{ margin: '0 0 22px', fontSize: 13, lineHeight: 1.5, color: '#666', textAlign: 'center' }}>
          To protect your information, reset emails are only dispatched if an account exists.
          {email ? ` If ${maskEmail(email)} is in our system, your link is on its way.` : ' If your email is in our system, your link is on its way.'}
        </p>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#121212' }}>
          <div className="mb-2">
            <span className="text-neutral-500">Didn't receive it? </span>
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={handleResend}
              style={{
                border: 'none',
                background: 'none',
                cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                color: cooldown > 0 ? '#888' : '#121212',
                textDecoration: cooldown > 0 ? 'none' : 'underline',
              }}
            >
              {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend link'}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 13,
                color: '#666',
              }}
            >
              ← Re-enter email address
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-[#121212] hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}