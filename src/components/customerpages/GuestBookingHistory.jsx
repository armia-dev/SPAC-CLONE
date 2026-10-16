import { useState } from "react";

/**
 * FindYourBooking
 * Hero + reference-number search only. Render your results below this
 * component after `onSearch` resolves.
 *
 * Props:
 *  - onSearch(referenceNumber): called on submit / search icon click
 *  - backgroundImage: URL of the court photo shown behind the hero
 */
export default function FindYourBooking({
  onSearch = () => {},
  backgroundImage = "/images/court-hero.jpg",
}) {
  const [reference, setReference] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = reference.trim();
    if (value) onSearch(value);
  };

  return (
    <>
      <style>{css}</style>

      <section
        className="fyb-hero"
        style={{ "--fyb-bg": `url(${backgroundImage})` }}
      >
        <div className="fyb-inner">
          <p className="fyb-eyebrow">BOOKING LOOKUP</p>
          <h1 className="fyb-title">Find your booking</h1>
          <p className="fyb-subtitle">
            Enter the reference number shown on your receipt to search for your
            booking.
          </p>

          <form className="fyb-search" onSubmit={handleSubmit} role="search">
            <input
              type="text"
              className="fyb-input"
              placeholder="Enter reference number here"
              aria-label="Reference number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <button
              type="submit"
              className="fyb-search-btn"
              aria-label="Search booking"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap");

.fyb-hero {
  --fyb-lime: #ccff00;
  /* must match the content panel's top padding in CustomerMainForm (py-5 = 20px, sm:py-6 = 24px) */
  --fyb-parent-pt: 20px;
  font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  position: relative;
  /* break out of the parent's side padding: full screen width */
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  /* cancel the parent's top padding so the image touches the header */
  margin-top: calc(var(--fyb-parent-pt) * -1);
  min-height: 380px;
  padding: 24px 20px 56px;
  display: flex;
  justify-content: center;
  text-align: center;
  color: #fff;
  background-color: #0d2b4a;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
    var(--fyb-bg);
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .fyb-hero {
    --fyb-parent-pt: 24px;
  }
}

.fyb-hero *,
.fyb-hero *::before,
.fyb-hero *::after {
  box-sizing: border-box;
  font-family: inherit;
}

.fyb-inner {
  width: 100%;
  max-width: 820px;
}

.fyb-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--fyb-lime);
}

.fyb-title {
  margin: 4px 0 0;
  font-size: clamp(36px, 6vw, 60px);
  font-weight: 700;
  line-height: 1.15;
  color: #fff;
}

.fyb-subtitle {
  margin: 28px auto 32px;
  max-width: 720px;
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 400;
  line-height: 1.5;
  color: #fff;
}

.fyb-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  background: #fff;
  border-radius: 12px;
}

.fyb-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 64px 0 20px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-size: 18px;
  font-weight: 400;
  color: #1a1a1a;
  outline: none;
}

.fyb-input::placeholder {
  color: #6b6b6b;
}

.fyb-search:focus-within {
  box-shadow: 0 0 0 3px var(--fyb-lime);
}

.fyb-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #444;
  cursor: pointer;
}

.fyb-search-btn:hover {
  color: #000;
}

.fyb-search-btn:focus-visible {
  outline: 2px solid #000;
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .fyb-hero {
    min-height: 320px;
    padding-bottom: 40px;
  }
  .fyb-search {
    height: 52px;
  }
  .fyb-input {
    font-size: 16px;
  }
}
`;