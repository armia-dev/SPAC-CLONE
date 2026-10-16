import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Questions', count: 20 },
  { id: 'GENERAL', label: 'General FAQs', count: 9 },
  { id: 'BOOKING', label: 'Booking Guidelines', count: 2 },
  { id: 'RAIN', label: 'Rain Policy', count: 4 },
  { id: 'LIABILITY', label: 'Liability Notice', count: 5 },
];

const GENERAL_FAQS = [
  {
    num: '01',
    q: 'How many courts do you have?',
    a: (
      <>
        We currently have <strong className="text-[#141414] font-bold">1 covered pickleball court.</strong>
      </>
    ),
    rawText: 'How many courts do you have? We currently have 1 covered pickleball court.'
  },
  {
    num: '02',
    q: 'Is the court covered?',
    a: (
      <>
        Yes, our court is an <strong className="text-[#141414] font-bold">open-air outdoor court</strong> with protective shelter coverage.
      </>
    ),
    rawText: 'Is the court covered? Yes, our court is an open-air outdoor court with protective shelter coverage.'
  },
  {
    num: '03',
    q: 'Do you have parking?',
    a: (
      <>
        Yes, street parking is available for approximately <strong className="text-[#141414] font-bold">2–3 vehicles.</strong>
      </>
    ),
    rawText: 'Do you have parking? Yes, street parking is available for approximately 2-3 vehicles.'
  },
  {
    num: '04',
    q: 'Do you have toilets?',
    a: (
      <>
        Yes, restrooms are available for guests. <span className="italic text-[#4E4B3E]">(Shower facilities are not available.)</span>
      </>
    ),
    rawText: 'Do you have toilets? Yes, restrooms are available for guests. (Shower facilities are not available.)'
  },
  {
    num: '05',
    q: 'Can we bring outside food and drinks?',
    a: (
      <>
        No, outside food and beverages aren't allowed. <strong className="text-[#141414] font-bold">D'Rafael's Café</strong> is on-site to serve fresh food, drinks, and snacks.
      </>
    ),
    rawText: "Can we bring outside food and drinks? No, outside food and beverages aren't allowed. D'Rafael's Café is on-site to serve fresh food, drinks, and snacks."
  },
  {
    num: '06',
    q: 'Do you have coaches available?',
    a: (
      <>
        Yes — private coaching for advanced training, plus special <strong className="text-[#141414] font-bold">Learn to Play</strong> sessions tailored for first-timers!
      </>
    ),
    rawText: 'Do you have coaches available? Yes — private coaching for advanced training, plus special Learn to Play sessions tailored for first-timers!'
  },
  {
    num: '07',
    q: 'Can we bring pets?',
    a: (
      <>
        Yes! Pets are welcome as long as they <strong className="text-[#141414] font-bold">wear diapers</strong> and stay strictly under their owner's supervision.
      </>
    ),
    rawText: "Can we bring pets? Yes! Pets are welcome as long as they wear diapers and stay strictly under their owner's supervision."
  },
  {
    num: '08',
    q: 'What shoes are allowed?',
    a: (
      <>
        Tennis or pickleball shoes are highly recommended. Regular rubber shoes are allowed but not recommended. Slippers or crocs are strictly not allowed.
      </>
    ),
    rawText: 'What shoes are allowed? Tennis or pickleball shoes are highly recommended. Regular rubber shoes are allowed but not recommended. Slippers or crocs are strictly not allowed.'
  },
  {
    num: '09',
    q: 'Are kids allowed?',
    a: (
      <>
        Yes! Children are welcome and are included in the overall court head count for all court bookings.
      </>
    ),
    fullSpan: true,
    rawText: 'Are kids allowed? Yes! Children are welcome and are included in the overall court head count for all court bookings.'
  },
];

const BOOKING_GUIDELINES = [
  {
    num: '01',
    q: 'Payment Policy',
    a: 'Full payment is required to confirm your court reservation. Bookings are only officially confirmed after payment has been received.',
    rawText: 'Payment Policy Full payment is required to confirm your court reservation. Bookings are only officially confirmed after payment has been received.'
  },
  {
    num: '02',
    q: 'Advance Booking',
    a: 'Walk-ins are not recommended. We encourage guests to book in advance to ensure the court is available on your preferred date and time.',
    rawText: 'Advance Booking Walk-ins are not recommended. We encourage guests to book in advance to ensure the court is available on your preferred date and time.'
  },
];

const RAIN_POLICY = [
  {
    num: '01',
    q: 'Reschedule Option',
    a: 'You can reschedule your booking to any date and time you prefer, subject to court availability.',
    rawText: 'Reschedule Option You can reschedule your booking to any date and time you prefer, subject to court availability.'
  },
  {
    num: '02',
    q: 'Open Play Reschedule',
    a: 'You may move to the next Open Play schedule if available, or keep your credit for future use.',
    rawText: 'Open Play Reschedule You may move to the next Open Play schedule if available, or keep your credit for future use.'
  },
  {
    num: '03',
    q: 'Court Rental Partial Play',
    a: 'More than 30 minutes played is counted as a full hour. Less than 30 minutes is credited as a half-hour toward rescheduling.',
    rawText: 'Court Rental Partial Play More than 30 minutes played is counted as a full hour. Less than 30 minutes is credited as a half-hour toward rescheduling.'
  },
  {
    num: '04',
    q: 'Open Play Partial Play',
    a: "If you've played more than 2 hours, the session is considered full. Less than 2 hours, you may reschedule to the next available Open Play.",
    rawText: "Open Play Partial Play If you've played more than 2 hours, the session is considered full. Less than 2 hours, you may reschedule to the next available Open Play."
  },
];

const LIABILITY_NOTICE = [
  {
    num: '01',
    q: 'Assumption of Risk',
    a: 'Pickleball is an active physical activity and carries an inherent risk of injury. By booking and using the court, players acknowledge and accept this risk.',
    rawText: 'Assumption of Risk Pickleball is an active physical activity and carries an inherent risk of injury. By booking and using the court, players acknowledge and accept this risk.'
  },
  {
    num: '02',
    q: 'Personal Belongings',
    a: 'Saranay Pickleball Court is not responsible for lost, damaged, or stolen personal items brought onto the premises.',
    rawText: 'Personal Belongings Saranay Pickleball Court is not responsible for lost, damaged, or stolen personal items brought onto the premises.'
  },
  {
    num: '03',
    q: 'Player Conduct',
    a: 'Players are expected to follow court rules and staff instructions at all times. The management reserves the right to refuse service for unsafe or disruptive conduct.',
    rawText: 'Player Conduct Players are expected to follow court rules and staff instructions at all times. The management reserves the right to refuse service for unsafe or disruptive conduct.'
  },
  {
    num: '04',
    q: 'Equipment Use',
    a: 'Rental equipment should be used properly and returned in the condition it was provided. Damage beyond normal wear may be charged accordingly.',
    rawText: 'Equipment Use Rental equipment should be used properly and returned in the condition it was provided. Damage beyond normal wear may be charged accordingly.'
  },
  {
    num: '05',
    q: 'Minors & Guardianship',
    a: 'Guests bringing minors are strictly responsible for their supervision throughout the entire duration of the booking.',
    fullSpan: true,
    rawText: 'Minors & Guardianship Guests bringing minors are strictly responsible for their supervision throughout the entire duration of the booking.'
  },
];

export default function FAQs() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const matchesSearch = (item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.rawText.toLowerCase().includes(q);
  };

  const filteredGeneral = useMemo(() => GENERAL_FAQS.filter(matchesSearch), [searchQuery]);
  const filteredBooking = useMemo(() => BOOKING_GUIDELINES.filter(matchesSearch), [searchQuery]);
  const filteredRain = useMemo(() => RAIN_POLICY.filter(matchesSearch), [searchQuery]);
  const filteredLiability = useMemo(() => LIABILITY_NOTICE.filter(matchesSearch), [searchQuery]);

  const showGeneral = (selectedCategory === 'ALL' || selectedCategory === 'GENERAL') && filteredGeneral.length > 0;
  const showBooking = (selectedCategory === 'ALL' || selectedCategory === 'BOOKING') && filteredBooking.length > 0;
  const showRain = (selectedCategory === 'ALL' || selectedCategory === 'RAIN') && filteredRain.length > 0;
  const showLiability = (selectedCategory === 'ALL' || selectedCategory === 'LIABILITY') && filteredLiability.length > 0;

  return (
    <div
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
      className="w-full flex flex-col space-y-10 text-neutral-900 antialiased"
    >
      {/* HERO HEADER SECTION */}
      <div className="w-full pt-4 pb-6 border-b border-[#DFD8C4] flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        {/* Left: Eyebrow + Heading + Subtitle */}
        <div className="max-w-[672px] space-y-3">
          {/* Eyebrow Tag */}
          <div
            style={{
              background: '#F3F8D3',
              border: '1px solid rgba(199, 219, 46, 0.4)',
              borderRadius: '9999px',
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5"
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                background: '#C7DB2E',
                borderRadius: '9999px',
              }}
              className="shrink-0"
            />
            <span
              style={{
                letterSpacing: '1.2px',
                color: '#4D580C',
              }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              INFORMATION & COURT HOUSE RULES
            </span>
          </div>

          {/* Heading 1 */}
          <h1
            style={{
              letterSpacing: '-1.2px',
              lineHeight: '1.05',
              color: '#141414',
            }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold"
          >
            FAQs & Guidelines
          </h1>

          {/* Subtitle description */}
          <p
            style={{
              color: '#575447',
              lineHeight: '24px',
            }}
            className="text-sm sm:text-base font-normal max-w-xl"
          >
            Everything you need to know about court bookings, cancellations, weather policies, and house rules.
          </p>
        </div>

        {/* Right: Interactive Search Bar */}
        <div className="w-full sm:w-[392px] shrink-0">
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #D4CCB4',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
            }}
            className="relative flex items-center px-4 py-3.5 sm:py-4 transition-all focus-within:border-[#141414] focus-within:ring-2 focus-within:ring-[#C7DB2E]/40"
          >
            <Search className="w-5 h-5 text-[#7C7764] shrink-0 mr-3 stroke-[1.8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. shoes, rain, refund, cafe)..."
              style={{ color: '#141414' }}
              className="w-full bg-transparent text-sm placeholder:text-[#8B8573] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#7C7764] hover:text-black font-semibold ml-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="w-full overflow-x-auto scrollbar-none pb-2">
        <div className="inline-flex items-center gap-2 sm:gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: isActive ? '#171717' : '#FFFFFF',
                  border: isActive ? '1px solid #171717' : '1px solid #E5DFCF',
                  borderRadius: '9999px',
                  boxShadow: isActive
                    ? '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)'
                    : '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 cursor-pointer whitespace-nowrap transition-all select-none"
              >
                <span
                  style={{
                    color: isActive ? '#C7DB2E' : '#404040',
                  }}
                  className={`text-sm font-semibold tracking-normal ${isActive ? 'font-bold' : ''}`}
                >
                  {cat.label}
                </span>

                {/* Count Badge */}
                <span
                  style={{
                    background: isActive ? 'rgba(199, 219, 46, 0.2)' : '#F5F5F5',
                    color: isActive ? '#C7DB2E' : '#737373',
                    borderRadius: '9999px',
                  }}
                  className="px-2 py-0.5 text-[11px] font-bold"
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: GENERAL FAQS */}
      {showGeneral && (
        <section className="w-full space-y-5">
          {/* Section Header */}
          <div className="w-full pb-3 border-b border-[#E5DFCF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Lime vertical pill */}
              <div
                style={{
                  width: '10px',
                  height: '28px',
                  background: '#C7DB2E',
                  borderRadius: '9999px',
                }}
                className="shrink-0"
              />
              <div>
                <h2
                  style={{
                    letterSpacing: '-0.6px',
                    color: '#171717',
                  }}
                  className="text-xl sm:text-2xl font-black uppercase"
                >
                  GENERAL FAQS
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#737373] mt-0.5">
                  Court setup, amenities, facility features & hospitality
                </p>
              </div>
            </div>

            {/* Total items tag */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5DFCF',
                borderRadius: '9999px',
              }}
              className="px-3 py-1 text-xs font-bold text-[#737373] shrink-0"
            >
              {filteredGeneral.length} items
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGeneral.map((faq) => (
              <div
                key={faq.num}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E3DCB8',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 6px -1px rgba(20, 20, 20, 0.04), 0px 2px 4px -2px rgba(20, 20, 20, 0.03)',
                }}
                className={`p-5 flex items-start gap-4 ${faq.fullSpan ? 'md:col-span-2' : ''}`}
              >
                {/* Number Badge */}
                <div
                  style={{
                    background: '#F4F9CE',
                    border: '1px solid #D7E84B',
                    borderRadius: '12px',
                    color: '#556306',
                  }}
                  className="w-9 h-9 shrink-0 flex items-center justify-center font-extrabold text-sm"
                >
                  {faq.num}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3
                    style={{ color: '#141414' }}
                    className="font-bold text-base leading-snug"
                  >
                    {faq.q}
                  </h3>
                  <div
                    style={{ color: '#4E4B3E' }}
                    className="text-sm leading-relaxed"
                  >
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: BOOKING GUIDELINES */}
      {showBooking && (
        <section className="w-full space-y-5">
          {/* Section Header */}
          <div className="w-full pb-3 border-b border-[#E5DFCF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '10px',
                  height: '28px',
                  background: '#C7DB2E',
                  borderRadius: '9999px',
                }}
                className="shrink-0"
              />
              <div>
                <h2
                  style={{
                    letterSpacing: '-0.6px',
                    color: '#171717',
                  }}
                  className="text-xl sm:text-2xl font-black uppercase"
                >
                  BOOKING GUIDELINES
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#737373] mt-0.5">
                  Reservation procedures, policies & requirements
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5DFCF',
                borderRadius: '9999px',
              }}
              className="px-3 py-1 text-xs font-bold text-[#737373] shrink-0"
            >
              {filteredBooking.length} items
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooking.map((guideline) => (
              <div
                key={guideline.num}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E3DCB8',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 6px -1px rgba(20, 20, 20, 0.04), 0px 2px 4px -2px rgba(20, 20, 20, 0.03)',
                }}
                className="p-5 flex items-start gap-4"
              >
                <div
                  style={{
                    background: '#F4F9CE',
                    border: '1px solid #D7E84B',
                    borderRadius: '12px',
                    color: '#556306',
                  }}
                  className="w-9 h-9 shrink-0 flex items-center justify-center font-extrabold text-sm"
                >
                  {guideline.num}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3
                    style={{ color: '#141414' }}
                    className="font-bold text-base leading-snug"
                  >
                    {guideline.q}
                  </h3>
                  <p
                    style={{ color: '#4E4B3E' }}
                    className="text-sm leading-relaxed"
                  >
                    {guideline.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: RAIN POLICY */}
      {showRain && (
        <section className="w-full space-y-5">
          {/* Section Header */}
          <div className="w-full pb-3 border-b border-[#E5DFCF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '10px',
                  height: '28px',
                  background: '#C7DB2E',
                  borderRadius: '9999px',
                }}
                className="shrink-0"
              />
              <div>
                <h2
                  style={{
                    letterSpacing: '-0.6px',
                    color: '#171717',
                  }}
                  className="text-xl sm:text-2xl font-black uppercase"
                >
                  RAIN POLICY
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#737373] mt-0.5">
                  Weather protocols, reschedules & credits
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5DFCF',
                borderRadius: '9999px',
              }}
              className="px-3 py-1 text-xs font-bold text-[#737373] shrink-0"
            >
              {filteredRain.length} items
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRain.map((rain) => (
              <div
                key={rain.num}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E3DCB8',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 6px -1px rgba(20, 20, 20, 0.04), 0px 2px 4px -2px rgba(20, 20, 20, 0.03)',
                }}
                className="p-5 flex items-start gap-4"
              >
                <div
                  style={{
                    background: '#F4F9CE',
                    border: '1px solid #D7E84B',
                    borderRadius: '12px',
                    color: '#556306',
                  }}
                  className="w-9 h-9 shrink-0 flex items-center justify-center font-extrabold text-sm"
                >
                  {rain.num}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3
                    style={{ color: '#141414' }}
                    className="font-bold text-base leading-snug"
                  >
                    {rain.q}
                  </h3>
                  <p
                    style={{ color: '#4E4B3E' }}
                    className="text-sm leading-relaxed"
                  >
                    {rain.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: LIABILITY NOTICE */}
      {showLiability && (
        <section className="w-full space-y-5">
          {/* Section Header */}
          <div className="w-full pb-3 border-b border-[#E5DFCF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '10px',
                  height: '28px',
                  background: '#C7DB2E',
                  borderRadius: '9999px',
                }}
                className="shrink-0"
              />
              <div>
                <h2
                  style={{
                    letterSpacing: '-0.6px',
                    color: '#171717',
                  }}
                  className="text-xl sm:text-2xl font-black uppercase"
                >
                  LIABILITY NOTICE
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#737373] mt-0.5">
                  Safety, conduct, and player responsibility rules
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5DFCF',
                borderRadius: '9999px',
              }}
              className="px-3 py-1 text-xs font-bold text-[#737373] shrink-0"
            >
              {filteredLiability.length} items
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLiability.map((item) => (
              <div
                key={item.num}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E3DCB8',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 6px -1px rgba(20, 20, 20, 0.04), 0px 2px 4px -2px rgba(20, 20, 20, 0.03)',
                }}
                className={`p-5 flex items-start gap-4 ${item.fullSpan ? 'md:col-span-2' : ''}`}
              >
                <div
                  style={{
                    background: '#F4F9CE',
                    border: '1px solid #D7E84B',
                    borderRadius: '12px',
                    color: '#556306',
                  }}
                  className="w-9 h-9 shrink-0 flex items-center justify-center font-extrabold text-sm"
                >
                  {item.num}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3
                    style={{ color: '#141414' }}
                    className="font-bold text-base leading-snug"
                  >
                    {item.q}
                  </h3>
                  <p
                    style={{ color: '#4E4B3E' }}
                    className="text-sm leading-relaxed"
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NO RESULTS FOUND STATE */}
      {!showGeneral && !showBooking && !showRain && !showLiability && (
        <div className="w-full text-center py-12 bg-white rounded-2xl border border-[#E5DFCF]">
          <p className="text-base font-bold text-neutral-800">No questions found matching "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-3 text-xs font-bold text-[#556306] hover:underline cursor-pointer"
          >
            Reset search filter
          </button>
        </div>
      )}

      {/* HELP / CONTACT BANNER AT THE BOTTOM */}
      <div
        style={{
          background: 'linear-gradient(90deg, #171717 0%, #252522 100%)',
          border: '1px solid #262626',
          borderRadius: '16px',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
        className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <span
            style={{
              letterSpacing: '1.2px',
              color: '#C7DB2E',
            }}
            className="text-xs font-bold uppercase tracking-wider block"
          >
            STILL HAVE QUESTIONS?
          </span>
          <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Need help or have special inquiries?
          </h4>
          <p className="text-xs sm:text-sm text-[#A3A3A3]">
            Reach out to our staff directly on Facebook or give us a quick call.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:+639270458745"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}
            className="px-5 py-2.5 text-xs font-semibold text-white uppercase tracking-wider hover:bg-white/20 transition-colors inline-block"
          >
            CALL US
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#C7DB2E',
              borderRadius: '12px',
              boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
            }}
            className="px-6 py-2.5 text-xs font-extrabold text-[#141414] uppercase tracking-wider hover:bg-[#b8e600] active:scale-95 transition-all inline-block"
          >
            MESSAGE FACEBOOK
          </a>
        </div>
      </div>
    </div>
  );
}
