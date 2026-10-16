import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * AboutUs tab content.
 * Rendered inside CustomerMainForm's content panel, which already provides:
 *  - font family, page background, text selection color
 *  - max-width container + horizontal/vertical padding
 * So this component only fills the available width (w-full) and never
 * sets its own min-h-screen, background, max-width, or page padding.
 */

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '3.99929px solid #FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
};

const iconBoxStyle = {
  backgroundColor: '#F5FFD9',
  border: '3.99929px solid #FFFFFF',
  borderRadius: '12px',
  color: '#4C7B38',
};

const collageCardStyle = {
  border: '1.99965px solid #CCFF00',
  borderRadius: '16px',
};

export default function AboutUs({ onNavigateToTab }) {
  // Switch to Home, then scroll to an element once Home has mounted
  const goHomeAndScroll = (elementId) => {
    onNavigateToTab?.('HOME');

    if (!elementId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Home isn't rendered yet, so retry until the element exists
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 20) {
        setTimeout(tryScroll, 50);
      }
    };
    setTimeout(tryScroll, 100);
  };
    return (
    <div className="w-full min-w-0 space-y-10 sm:space-y-12 text-neutral-900">
      {/* HERO SECTION */}
      <section className="relative w-full bg-neutral-900 text-white rounded-2xl overflow-hidden min-h-[460px] lg:min-h-[520px] flex items-center">
        {/* Background image */}
        <img
          src="/src/assets/bgpic.jpg"
          alt="Saranay Pickleball Court"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] contrast-105"
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

        <div className="relative z-10 w-full px-6 sm:px-10 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left hero content */}
            <div className="lg:col-span-7 space-y-6 min-w-0">
              {/* Badge pill */}
              <div
                style={{
                  backgroundColor: '#336124',
                  border: '1.99965px solid #CCFF00',
                  borderRadius: '9999px',
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                <span className="text-[11px] font-bold tracking-wider text-[#CCFF00] uppercase">
                  SARANAY PICKLEBALL COURT
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12]">
                Where every rally <br className="hidden sm:block" />
                feels like <span className="text-[#CCFF00]">home court.</span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-[14.5px] text-neutral-200 leading-relaxed max-w-xl font-normal">
                Tucked in North Caloocan, Saranay is a private, single-court pickleball venue built for players who want a good game without the noise of a big commercial club — open-air, well-kept, and paired with D' Rafael's Café right on site.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => goHomeAndScroll()}
                  style={{
                    backgroundColor: '#CCFF00',
                    border: '3.99929px solid #CCFF00',
                    borderRadius: '25px',
                    color: '#000000',
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg active:scale-95 transition-transform"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={() => goHomeAndScroll('rates-section')}
                  style={{
                    backgroundColor: 'transparent',
                    border: '3.99929px solid #CCFF00',
                    borderRadius: '25px',
                    color: '#CCFF00',
                  }}
                  className="inline-flex items-center justify-center px-6 py-2.5 font-extrabold text-xs sm:text-sm cursor-pointer hover:bg-[#CCFF00]/10 transition-colors"
                >
                  <span>Check Pricing</span>
                </button>
              </div>
            </div>

            {/* Right hero: 3-image collage (hidden on small screens to avoid overflow) */}
            <div className="hidden md:flex lg:col-span-5 relative w-full justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] h-[340px] sm:h-[380px]">
                <div
                  style={collageCardStyle}
                  className="absolute top-0 right-4 sm:right-6 w-[235px] sm:w-[260px] aspect-[16/10] overflow-hidden shadow-2xl z-20"
                >
                  <img
                    src="/src/assets/bgpic.jpg"
                    alt="Players on court"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  style={collageCardStyle}
                  className="absolute top-20 left-2 sm:left-4 w-[190px] sm:w-[215px] aspect-[4/3] overflow-hidden shadow-2xl z-30"
                >
                  <img
                    src="/src/assets/cafebg.jpg"
                    alt="Player ready to serve"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  style={collageCardStyle}
                  className="absolute bottom-0 right-0 w-[225px] sm:w-[250px] aspect-[16/10] overflow-hidden shadow-2xl z-10"
                >
                  <img
                    src="/src/assets/pickleballbg.jpg"
                    alt="Court overview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: WHY PLAY HERE */}
      <section className="w-full">
        <div className="space-y-1 mb-7">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-[#C42B2B]">
            WHY PLAY HERE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
            Built for a better game
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Well-Maintained Court */}
          <div style={cardStyle} className="p-6 flex flex-col justify-start">
            <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center mb-4 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#4C7B38] mb-1">
              Well-Maintained Court
            </h3>
            <p className="text-xs sm:text-[13px] text-[#000000] leading-relaxed">
              Open-air and no shared bookings.
            </p>
          </div>

          {/* Card 2: On-Site Café */}
          <div style={cardStyle} className="p-6 flex flex-col justify-start">
            <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center mb-4 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#4C7B38] mb-1">
              On-Site Café
            </h3>
            <p className="text-xs sm:text-[13px] text-[#000000] leading-relaxed">
              On-site café for drinks and snacks — outside food isn't permitted.
            </p>
          </div>

          {/* Card 3: Flexible Playing Options */}
          <div style={cardStyle} className="p-6 flex flex-col justify-start">
            <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center mb-4 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="9" r="4.5" />
                <path d="M8 13.5V20" />
                <circle cx="16" cy="10.5" r="4.5" />
                <path d="M16 15v5" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#4C7B38] mb-1">
              Flexible Playing Options
            </h3>
            <p className="text-xs sm:text-[13px] text-[#000000] leading-relaxed">
              Choose from private court rentals or weekend Open Play sessions.
            </p>
          </div>

          {/* Card 4: Pet Friendly */}
          <div style={cardStyle} className="p-6 flex flex-col justify-start">
            <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center mb-4 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#4C7B38] mb-1">
              Pet Friendly
            </h3>
            <p className="text-xs sm:text-[13px] text-[#000000] leading-relaxed">
              Pets are welcome as long as they are wearing diapers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: FIND US & GAME HOURS */}
      <section className="w-full pb-2">
        <div className="space-y-1 mb-7">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-[#C42B2B]">
            FIND US
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
            Get in touch & game hours
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left column: contact cards */}
          <div className="lg:col-span-7 space-y-4 min-w-0">
            {/* Exact Location */}
            <div style={cardStyle} className="p-5 flex items-center gap-4">
              <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold tracking-wider text-[#4C7B38] uppercase block">
                  EXACT LOCATION
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#121212] leading-snug border-b border-black inline-block pb-0.5">
                  Saranay Homes, Block 5 Lot 13 Saranay Road, Bagumbong, North, Caloocan
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div style={cardStyle} className="p-5 flex items-center gap-4">
              <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold tracking-wider text-[#4C7B38] uppercase block">
                  PHONE NUMBER
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#121212] leading-snug tracking-wide">
                  0927-045-8745 <span className="text-neutral-400 font-normal mx-2">|</span> 0906-545-8384
                </p>
              </div>
            </div>

            {/* Facebook */}
            <div style={cardStyle} className="p-5 flex items-center gap-4">
              <div style={iconBoxStyle} className="w-12 h-12 flex items-center justify-center shrink-0">
                <span className="font-extrabold text-lg leading-none">f</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold tracking-wider text-[#4C7B38] uppercase block">
                  FACEBOOK
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#121212] leading-snug border-b border-black inline-block pb-0.5">
                  Saranay Pickleball Court and Cafe
                </p>
              </div>
            </div>
          </div>

          {/* Right column: court hours */}
          <div style={cardStyle} className="lg:col-span-5 p-7 space-y-6 min-w-0">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#4C7B38]">Court Hours</h3>
              <p className="text-xs text-[#545454] mt-0.5">
                Daily schedule — plan your session ahead
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-[13px]">
              <div
                style={{ borderColor: '#E0E0D8' }}
                className="flex items-center justify-between gap-3 pb-3 border-b"
              >
                <span className="text-neutral-700 font-medium">Daytime Court</span>
                <span className="font-bold text-[#000000] tracking-tight whitespace-nowrap">
                  6:00 AM - 6:00 PM
                </span>
              </div>

              <div
                style={{ borderColor: '#E0E0D8' }}
                className="flex items-center justify-between gap-3 pb-3 border-b"
              >
                <span className="text-neutral-700 font-medium">Nighttime Court</span>
                <span className="font-bold text-[#000000] tracking-tight whitespace-nowrap">
                  6:00 PM - 2:00 AM
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <span className="text-neutral-700 font-medium">Open Play (Friday - Sunday)</span>
                <span className="font-bold text-[#000000] tracking-tight whitespace-nowrap">
                  6:00 PM - 10:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}