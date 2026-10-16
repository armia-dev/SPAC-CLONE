import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Area, AreaChart, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Table,
} from 'lucide-react';
import ReportModal from './ReportModal';

/* -------------------------------------------------------------------------- */
/*  Mock data (hard coded). Replace with real data from your backend later.    */
/* -------------------------------------------------------------------------- */

const BASE_DAYS = 33; // the mock numbers below describe a 33-day period

const BASE = {
  courtRental: 29700,
  equipment: 4860,
  avgTrend: 3.1,
  revenueTrend: 12.4,
  transactionsTrend: -0.5,
  occupancyTrend: 5.2,
  cancellationTrend: -1.2,
  statuses: { completed: 168, cancelled: 15, noShow: 8 },
  slots: [
    { label: '6 AM – 12 PM', hrs: 55, cap: 110, color: '#f59e0b' },
    { label: '12 PM – 6 PM', hrs: 79, cap: 100, color: '#3b82f6' },
    { label: '6 PM – 10 PM', hrs: 93, cap: 110, color: '#10b981' },
  ],
  // Relative weight of each point on the revenue trend chart
  trend: [6000, 6300, 7000, 6100, 8300, 6400, 6100],
};

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                               */
/* -------------------------------------------------------------------------- */

const DAY_MS = 86400000;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// Real "today" at 00:00 local time, plus the default range
const TODAY = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const DEFAULT_RANGE = { start: addDays(TODAY, -29), end: TODAY };

const sameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();
const daysBetween = (a, b) => Math.round((b - a) / DAY_MS) + 1;
const fmtShort = (d) => `${MON[d.getMonth()]} ${d.getDate()}`;
const fmtFull = (d) => `${fmtShort(d)}, ${d.getFullYear()}`;
const fmtRange = (s, e) =>
  s.getFullYear() === e.getFullYear()
    ? `${fmtShort(s)} – ${fmtShort(e)}, ${e.getFullYear()}`
    : `${fmtFull(s)} – ${fmtFull(e)}`;

// The period right before the selected one, with the same length.
const prevRange = (start, end) => {
  const days = daysBetween(start, end);
  const pEnd = addDays(start, -1);
  return { start: addDays(pEnd, -(days - 1)), end: pEnd };
};

const PRESETS = [
  { id: '7d', label: 'Last 7 days', range: () => [addDays(TODAY, -6), TODAY] },
  { id: '30d', label: 'Last 30 days', range: () => [addDays(TODAY, -29), TODAY] },
  { id: 'month', label: 'This month', range: () => [monthStart(TODAY), TODAY] },
  {
    id: 'lastMonth',
    label: 'Last month',
    range: () => [
      new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1),
      new Date(TODAY.getFullYear(), TODAY.getMonth(), 0),
    ],
  },
  { id: 'year', label: 'This year', range: () => [new Date(TODAY.getFullYear(), 0, 1), TODAY] },
  {
    id: 'lastYear',
    label: 'Last year',
    range: () => [new Date(TODAY.getFullYear() - 1, 0, 1), new Date(TODAY.getFullYear() - 1, 11, 31)],
  },
  { id: 'custom', label: 'Custom range', range: null },
];

const detectPreset = ({ start, end }) =>
  PRESETS.find((p) => {
    if (!p.range) return false;
    const [s, e] = p.range();
    return sameDay(s, start) && sameDay(e, end);
  })?.id ?? 'custom';

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const peso = (n) => `₱${Math.round(n).toLocaleString('en-US')}`;

// Short money label: ₱950, ₱6.3K, ₱1.2M
const pesoShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `₱${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₱${Math.round(n)}`;
};

// Pick 4 evenly spaced Y-axis ticks (0, s, 2s, 3s) that cover `max`
const niceTicks = (max) => {
  if (max <= 0) return [0, 1000, 2000, 3000];
  const raw = max / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return [0, step, step * 2, step * 3];
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

// Inner tile used inside the main white card (matches the table row separators)
function Tile({ className = '', children }) {
  return <div className={`rounded-xl border border-[#c4c9ac] bg-white ${className}`}>{children}</div>;
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">{children}</h2>
  );
}

function Trend({ value, invert = false }) {
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <p
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        good ? 'text-[#226307]' : 'text-[#be1a1a]'
      }`}
    >
      <Icon className="w-3 h-3 stroke-[2.5]" />
      {Math.abs(value)}% <span className="text-[#6b7280] font-normal ml-0.5">vs previous period</span>
    </p>
  );
}

function ViewDetails({ className = '', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#121212] hover:underline transition-colors cursor-pointer ${className}`}
    >
      View details <ArrowRight className="w-3 h-3" />
    </button>
  );
}

// Static summary card: no "View details" link, no popup.
function Kpi({ label, value, trend, invert }) {
  return (
    <Tile className="p-4">
      <p className="text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#121212]">{value}</p>
      <div className="mt-1">
        <Trend value={trend} invert={invert} />
      </div>
    </Tile>
  );
}

function ProgressBar({ percent, color, height = 'h-2.5' }) {
  return (
    <div className={`w-full ${height} rounded-full bg-[#eceed8] overflow-hidden`}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(percent, 100))}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Date range picker                                                          */
/* -------------------------------------------------------------------------- */

function MonthGrid({ month, start, end, max, onPick, onPrev, onNext }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const lead = new Date(year, m, 1).getDay();
  const count = new Date(year, m + 1, 0).getDate();
  const cells = [
    ...Array(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => new Date(year, m, i + 1)),
  ];

  return (
    <div className="flex-1 min-w-[230px]">
      <div className="flex items-center justify-between mb-3 h-7">
        {onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous month"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-7" />
        )}
        <p className="text-xs font-bold text-[#121212]">
          {MONTHS_LONG[m]} {year}
        </p>
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-7" />
        )}
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-[#5f5e5e] mb-1">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <span key={`blank-${i}`} />;
          const isEdge = sameDay(d, start) || sameDay(d, end);
          const inRange = !!start && !!end && d >= start && d <= end;
          const disabled = !!max && d > max;
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={`h-8 text-xs transition-colors ${
                disabled
                  ? 'text-neutral-300 cursor-not-allowed'
                  : isEdge
                  ? 'bg-[#121212] text-[#ccff00] font-bold rounded-lg cursor-pointer'
                  : inRange
                  ? 'bg-[#e9f7a3] text-[#121212] font-medium cursor-pointer'
                  : 'text-[#121212] font-medium hover:bg-neutral-100 rounded-lg cursor-pointer'
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ value, onApply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [preset, setPreset] = useState('custom');
  const [view, setView] = useState(monthStart(value.start));
  const ref = useRef(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setDraft(value);
      setPreset(detectPreset(value));
      setView(monthStart(value.start));
    }
    setOpen((o) => !o);
  };

  const choosePreset = (p) => {
    setPreset(p.id);
    if (!p.range) return;
    const [start, end] = p.range();
    setDraft({ start, end });
    setView(monthStart(start));
  };

  const pick = (d) => {
    setPreset('custom');
    if (d > TODAY) return;
    if (!draft.start || draft.end) setDraft({ start: d, end: null });
    else if (d < draft.start) setDraft({ start: d, end: draft.start });
    else setDraft({ start: draft.start, end: d });
  };

  const shiftMonth = (n) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);

  const summary = draft.end
    ? (() => {
        const p = prevRange(draft.start, draft.end);
        return `${daysBetween(draft.start, draft.end)} days · compared with ${fmtShort(p.start)} – ${fmtShort(p.end)}`;
      })()
    : 'Select an end date';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Choose date range"
        className="h-[34px] sm:h-[36px] inline-flex items-center gap-2 rounded-xl border border-[#121212] bg-white px-3 text-xs font-semibold text-[#6b7280] hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer shadow-2xs"
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">{fmtRange(value.start, value.end)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date range"
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 w-[calc(100vw-3rem)] max-w-[720px] sm:w-[720px] rounded-2xl border border-[#121212] bg-white shadow-xl flex flex-col sm:flex-row overflow-hidden select-none"
        >
          {/* Presets */}
          <div className="sm:w-44 shrink-0 p-3 border-b sm:border-b-0 sm:border-r border-[#c4c9ac] flex sm:flex-col gap-1 overflow-x-auto">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePreset(p)}
                className={`text-left whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                  preset === p.id
                    ? 'bg-neutral-100 text-[#121212] font-bold'
                    : 'text-[#121212] font-medium hover:bg-neutral-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendars */}
          <div className="flex-1 p-4 sm:p-5 min-w-0 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                ['FROM', draft.start],
                ['TO', draft.end],
              ].map(([label, date]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold tracking-wider text-[#5f5e5e] mb-1">{label}</p>
                  <input
                    readOnly
                    value={date ? fmtFull(date) : ''}
                    placeholder="Select date"
                    className="w-full h-[34px] rounded-xl border border-[#121212] bg-white px-3 text-xs font-medium text-[#121212] placeholder-[#6b7280] outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <MonthGrid
                month={view}
                start={draft.start}
                end={draft.end}
                max={TODAY}
                onPick={pick}
                onPrev={() => shiftMonth(-1)}
              />
              <MonthGrid
                month={nextMonth}
                start={draft.start}
                end={draft.end}
                max={TODAY}
                onPick={pick}
                onNext={() => shiftMonth(1)}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#c4c9ac] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-[#5f5e5e]">{summary}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-[34px] rounded-xl border border-[#121212] bg-white px-4 text-xs font-semibold text-[#121212] hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!draft.end}
                  onClick={() => {
                    onApply(draft);
                    setOpen(false);
                  }}
                  className="h-[34px] rounded-xl border border-[#121212] bg-[#ccff00] px-4 text-xs font-semibold text-[#121212] hover:bg-[#b8e600] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Reports() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  // Which report modal is open: 'revenue' | 'utilization' | 'status' | null
  const [modal, setModal] = useState(null);
  const closeModal = useCallback(() => setModal(null), []);

  const data = useMemo(() => {
    const days = daysBetween(range.start, range.end);
    const f = days / BASE_DAYS; // scale the mock numbers with the period length
    const courtRental = Math.round(BASE.courtRental * f);
    const equipment = Math.round(BASE.equipment * f);
    const revenue = courtRental + equipment;

    const completed = Math.round(BASE.statuses.completed * f);
    const cancelled = Math.round(BASE.statuses.cancelled * f);
    const noShow = Math.round(BASE.statuses.noShow * f);
    const transactions = completed + cancelled + noShow;
    const pct = (n) => (transactions ? Math.round((n / transactions) * 100) : 0);

    const rawSlots = BASE.slots.map((s) => {
      const hrs = Math.round(s.hrs * f);
      const cap = Math.max(Math.round(s.cap * f), hrs);
      return { ...s, hrs, cap, occ: cap ? Math.round((hrs / cap) * 100) : 0 };
    });
    const booked = rawSlots.reduce((a, s) => a + s.hrs, 0);
    const available = rawSlots.reduce((a, s) => a + s.cap, 0);
    const maxHrs = Math.max(...rawSlots.map((s) => s.hrs));
    const slots = rawSlots.map((s) => ({
      ...s,
      share: booked ? Math.round((s.hrs / booked) * 100) : 0,
      peak: booked > 0 && s.hrs === maxHrs,
    }));

    // Trend points sum to the period revenue so the chart agrees with the cards
    const weightTotal = BASE.trend.reduce((a, b) => a + b, 0);
    const chart = BASE.trend.map((w, idx) => {
      const d = addDays(range.start, Math.round((idx * (days - 1)) / (BASE.trend.length - 1)));
      return { idx, value: Math.round((revenue * w) / weightTotal), label: `${d.getDate()} ${MON[d.getMonth()]}` };
    });
    const ticks = niceTicks(Math.max(...chart.map((c) => c.value)));

    return {
      days,
      courtRental,
      equipment,
      revenue,
      transactions,
      avg: transactions ? Math.round(revenue / transactions) : 0,
      statuses: [
        { label: 'Completed', count: completed, pct: pct(completed), color: '#10b981' },
        { label: 'Cancelled', count: cancelled, pct: pct(cancelled), color: '#f59e0b' },
        { label: 'No-show', count: noShow, pct: pct(noShow), color: '#ef4444' },
      ],
      cancellationRate: transactions ? ((cancelled / transactions) * 100).toFixed(1) : '0.0',
      slots,
      booked,
      available,
      bookedPct: available ? Math.round((booked / available) * 100) : 0,
      chart,
      ticks,
      prev: prevRange(range.start, range.end),
    };
  }, [range]);

  const rentalPct = data.revenue ? Math.round((data.courtRental / data.revenue) * 100) : 0;
  const equipmentPct = data.revenue ? 100 - rentalPct : 0;

  // "Excel" export: a CSV file that Excel opens directly.
  const exportExcel = () => {
    const rows = [
      ['Period', fmtRange(range.start, range.end)],
      ['Compared with', fmtRange(data.prev.start, data.prev.end)],
      ['Total revenue', data.revenue],
      ['Avg revenue / transaction', data.avg],
      ['Total transactions', data.transactions],
      ['Court occupancy rate (%)', data.bookedPct],
      ['Court rental revenue', data.courtRental],
      ['Equipment revenue', data.equipment],
      ...data.statuses.map((s) => [`Bookings - ${s.label}`, s.count]),
      ['Cancellation rate (%)', data.cancellationRate],
      ...data.slots.map((s) => [`Booked hours - ${s.label}`, s.hrs]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    // BOM so Excel reads the file as UTF-8
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saranay-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // TODO: swap for a real PDF generator (e.g. jsPDF) if you need a styled file.
  const exportPdf = () => window.print();

  const actionBtn =
    'h-[34px] sm:h-[36px] inline-flex items-center gap-1.5 rounded-xl border border-[#121212] px-3 sm:px-3.5 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shrink-0 shadow-2xs';

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }} className="w-full flex flex-col space-y-3">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">Reports</h1>
        <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
          Monitor court utilization, revenue, and booking trends at a glance.
        </p>
      </div>

      {/* Main White Card Container */}
      <div className="w-full bg-white border border-[#121212] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Toolbar: period info + date range + exports */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <p className="text-[11px] text-[#5f5e5e] leading-relaxed">
            Showing <span className="font-bold text-[#121212]">{fmtRange(range.start, range.end)}</span> ({data.days}{' '}
            {data.days === 1 ? 'day' : 'days'}) · Compared with{' '}
            <span className="font-bold text-[#121212]">{fmtRange(data.prev.start, data.prev.end)}</span>
          </p>

          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <DateRangePicker value={range} onApply={setRange} />
            <button
              type="button"
              onClick={exportExcel}
              className={`${actionBtn} bg-[#ffffff] text-[#0f4400] hover:bg-[#cfd0cc]`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Export Excel</span>
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className={`${actionBtn} bg-[#ffffff] text-[#440000] hover:bg-[#cfd0cc]`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Export PDF</span>
            </button>
          </div>
        </div>

        {/* KPI cards (static summaries) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total revenue" value={peso(data.revenue)} trend={BASE.revenueTrend} />
          <Kpi label="Avg. revenue / transaction" value={peso(data.avg)} trend={BASE.avgTrend} />
          <Kpi label="Total transactions" value={data.transactions} trend={BASE.transactionsTrend} />
          <Kpi label="Court occupancy rate" value={`${data.bookedPct}%`} trend={BASE.occupancyTrend} />
        </div>

        {/* Revenue overview */}
        <Tile className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#121212]">
            <div className="flex items-center gap-2 flex-wrap">
              <SectionTitle>Revenue overview</SectionTitle>
              <span className="rounded-full bg-[#baff95] px-2.5 py-0.5 text-[11px] font-semibold text-[#226307] whitespace-nowrap">
                {peso(data.revenue)} this period
              </span>
            </div>
            <ViewDetails className="print:hidden" onClick={() => setModal('revenue')} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Breakdown */}
            <div className="lg:w-[280px] shrink-0">
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#5f5e5e] mb-2">Breakdown</p>
              <div className="relative mx-auto h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Court Rental', value: data.courtRental },
                        { name: 'Equipment', value: data.equipment },
                      ]}
                      dataKey="value"
                      innerRadius={52}
                      outerRadius={72}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-[#5f5e5e]">Total</span>
                  <span className="text-lg font-bold text-[#121212]">{pesoShort(data.revenue)}</span>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Court Rental
                  </span>
                  <span>
                    <b>{peso(data.courtRental)}</b> <span className="text-[#6b7280]">{rentalPct}%</span>
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Equipment
                  </span>
                  <span>
                    <b>{peso(data.equipment)}</b> <span className="text-[#6b7280]">{equipmentPct}%</span>
                  </span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-[#c4c9ac] flex items-center justify-between text-xs font-bold text-[#121212]">
                <span>Total</span>
                <span>{peso(data.revenue)}</span>
              </div>
            </div>

            {/* Trend chart */}
            <div className="flex-1 min-w-0 h-[260px] lg:border-l lg:border-[#c4c9ac] lg:pl-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: '#c4c9ac' }}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    interval="preserveStartEnd"
                    minTickGap={12}
                  />
                  <YAxis
                    domain={[0, data.ticks[3]]}
                    ticks={data.ticks}
                    tickFormatter={pesoShort}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#6b9a1a"
                    strokeWidth={2}
                    fill="#6b9a1a"
                    fillOpacity={0.12}
                    dot={{ r: 3, fill: '#6b9a1a', stroke: '#6b9a1a' }}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={pesoShort}
                      style={{ fontSize: 11, fill: '#374151' }}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tile>

        {/* Utilization + booking status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Tile className="p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 pb-3 border-b border-[#121212]">
              <SectionTitle>Court utilization</SectionTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Court hours */}
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#5f5e5e] mb-2">Court hours</p>
                <p className="text-3xl font-bold tracking-tight text-[#121212]">
                  {data.bookedPct}% <span className="text-sm font-medium text-[#6b7280]">booked</span>
                </p>
                <div className="mt-3">
                  <ProgressBar percent={data.bookedPct} color="#ccff00" />
                </div>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  {data.booked} / {data.available} hrs
                </p>
                <dl className="mt-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#5f5e5e]">Available Hours</dt>
                    <dd className="font-bold text-[#121212]">{data.available} hrs</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5f5e5e]">Booked Hours</dt>
                    <dd className="font-bold text-[#121212]">{data.booked} hrs</dd>
                  </div>
                </dl>
              </div>

              {/* Time of day */}
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  Booked hours by time of day
                </p>
                <p className="text-[10px] text-[#6b7280] mb-3">Share of {data.booked} booked hrs</p>
                <div className="space-y-4">
                  {data.slots.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between gap-2 text-xs mb-1">
                        <span className="flex items-center gap-2 font-medium text-[#121212]">
                          {s.label}
                          {s.peak && (
                            <span className="rounded-md bg-[#ccff00] border border-[#121212] px-1.5 py-0.5 text-[9px] font-bold text-[#121212]">
                              Peak
                            </span>
                          )}
                        </span>
                        <span className="whitespace-nowrap">
                          <b>{s.hrs} hrs</b> <span className="text-[#6b7280]">{s.share}% of booked</span>
                        </span>
                      </div>
                      <ProgressBar percent={s.occ} color={s.color} height="h-2" />
                      <p className="mt-1 text-[10px] text-[#6b7280]">
                        {s.hrs} / {s.cap} hrs · {s.occ}% occupied
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ViewDetails className="mt-5 print:hidden" onClick={() => setModal('utilization')} />
          </Tile>

          <Tile className="p-4 sm:p-5">
            <div className="mb-4 pb-3 border-b border-[#121212]">
              <SectionTitle>Booking status</SectionTitle>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#eceed8]">
              {data.statuses.map((s) => (
                <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-xs">
              {data.statuses.map((s) => (
                <li key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#121212]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span>
                    <b>{s.count}</b> <span className="text-[#6b7280]">{s.pct}%</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-4 border-t border-[#c4c9ac]">
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#5f5e5e]">Cancellation rate</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[#121212]">{data.cancellationRate}%</p>
              <div className="mt-1">
                <Trend value={BASE.cancellationTrend} invert />
              </div>
              <ViewDetails className="mt-3 print:hidden" onClick={() => setModal('status')} />
            </div>
          </Tile>
        </div>
      </div>

      {/* Single reusable modal for all three remaining sections */}
      <ReportModal variant={modal} onClose={closeModal} range={range} data={data} />
    </div>
  );
}