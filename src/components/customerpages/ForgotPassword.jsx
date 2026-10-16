import { useState, useEffect, useRef } from "react";

const css = `
/* Backdrop: covers the whole screen on top of the page (popup) */
.fp-page {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  padding: 24px;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  color: #121212;
}
.fp-page * { box-sizing: border-box; }

/* Card: same size as the Login / Sign up popups */
.fp-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: auto; /* centers the card, and still scrolls on short screens */
  background: #fff;
  border-radius: 12px;
  padding: 28px 24px 22px;
}

.fp-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fp-head { display: flex; align-items: flex-start; }

.fp-key { flex: none; width: 28px; height: 68px; margin-top: 2px; }

.fp-head-text { flex: 1; margin-left: 16px; min-width: 0; }

.fp-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: #121212;
}

.fp-rule {
  height: 1px;
  background: #444;
  border: 0;
  margin: 8px 0 10px;
  width: 100%;
}

.fp-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: #666;
}

.fp-label {
  display: block;
  margin: 22px 0 6px;
  font-size: 13px;
  font-weight: 400;
  color: #121212;
}

.fp-input {
  display: block;
  width: 100%;
  height: 44px;
  border: 1.5px solid #D4C9A8;
  border-radius: 8px;
  padding: 0 14px;
  font-family: inherit;
  font-size: 14px;
  color: #121212;
  outline: none;
  background: #fff;
}
.fp-input::placeholder { color: #6b6b6b; font-weight: 300; }
.fp-input:focus { border-color: #b8ab7d; }

.fp-btn {
  display: block;
  width: 100%;
  height: 40px;
  margin: 22px 0 0;
  background: #ccff00;
  border: 1px solid #000;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
}
.fp-btn:hover { background: #bdf000; }

/* "Back to Sign in" is a button (it switches popups instead of changing the URL) */
.fp-back {
  display: block;
  width: 100%;
  margin: 18px 0 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  font-size: 12px;
  color: #121212;
  text-decoration: none;
}
.fp-back:hover { text-decoration: underline; }
`;

function KeyIcon() {
  return (
    <svg className="fp-key" viewBox="0 0 50 120" fill="none">
      {/* shaft */}
      <path
        d="M17 40 L33 40 L33 108 L26 119 L17 108 L17 100 L12 96 L17 90 L17 84 L11 80 L17 74 L17 40Z"
        fill="#f5d96b"
        stroke="#111"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M25 42 L25 112" stroke="#111" strokeWidth="1.5" />
      {/* head */}
      <circle cx="25" cy="22" r="21" fill="#f5d96b" stroke="#111" strokeWidth="1.5" />
      <circle cx="21" cy="14" r="5.5" fill="#fff" stroke="#111" strokeWidth="1.5" />
    </svg>
  );
}

export default function ForgotPassword({ onClose, onBack }) {
  const [email, setEmail] = useState("");

  // keep the latest onClose without re-running the effect below
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Popup behavior: lock the page behind it and close on Escape
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevPad = body.style.paddingRight;

    // keep the layout from jumping when the scrollbar disappears
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    window.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.paddingRight = prevPad;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call your send-OTP API here
    console.log("Send OTP to:", email);
  };

  return (
    <>
      <style>{css}</style>
      {/* backdrop: clicking outside the card closes it */}
      <div className="fp-page" onClick={onClose}>
        <div
          className="fp-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fp-title"
          onClick={(e) => e.stopPropagation()} // clicks inside the card don't close it
        >
          <button type="button" className="fp-close" aria-label="Close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          </button>

          <div className="fp-head">
            <KeyIcon />
            <div className="fp-head-text">
              <h1 id="fp-title" className="fp-title">FORGOT PASSWORD?</h1>
              <hr className="fp-rule" />
              <p className="fp-sub">
                Enter your email address and we'll send you a verification code
                to reset your password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="fp-label" htmlFor="fp-email">Email Address</label>
            <input
              id="fp-email"
              className="fp-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="fp-btn">SEND OTP</button>
          </form>

          <button type="button" className="fp-back" onClick={onBack ?? onClose}>
            ← Back to Sign in
          </button>
        </div>
      </div>
    </>
  );
}