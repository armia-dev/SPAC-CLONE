import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  ReportModal                                                                */
/*                                                                            */
/*  Reusable, centered, non-draggable modal for the Reports page.              */
/*                                                                            */
/*  Props                                                                      */
/*    variant : 'revenue' | 'utilization' | 'status' | null  (null = closed)   */
/*    onClose : () => void                                                     */
/*    range   : { start: Date, end: Date }  selected period                    */
/*    data    : the computed report object from Reports.jsx                    */
/*                                                                            */
/*  The rows below are MOCK data generated from the period totals so they      */
/*  add up to the numbers on the dashboard. Replace the builders with real     */
/*  API calls later - the table components only need arrays of row objects.    */
/* -------------------------------------------------------------------------- */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86400000;
const UTILIZATION_ROW_LIMIT = 300;

// [start hour, end hour] for each slot in BASE.slots (same order)
const SLOT_HOURS = [
  [6, 12],
  [12, 18],
  [18, 22],
];

const CUSTOMERS = [
  'Juan Dela Cruz', 'Maria Santos', 'Miguel Reyes', 'Angela Cruz', 'Paolo Garcia',
  'Bianca Ramos', 'Carlo Mendoza', 'Trisha Bautista', 'Luis Navarro', 'Kristine Aquino',
  'Marco Villanueva', 'Jasmine Torres', 'Rafael Castillo', 'Denise Flores', 'Gabriel Pascual',
  'Patricia Lim', 'Joshua Tan', 'Nicole Domingo', 'Andre Salazar', 'Clarisse Ocampo',
];

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmtDate = (d) => `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const peso = (n) => `₱${Math.round(n).toLocaleString('en-US')}`;
const fmtHour = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
const timeRange = (h, dur) => `${fmtHour(h)} – ${fmtHour(h + dur)}`;

// Small seeded RNG so the same period always shows the same rows
function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const makeRng = (range) =>
  mulberry32(Math.floor(range.start.getTime() / DAY_MS) * 31 + Math.floor(range.end.getTime() / DAY_MS));

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomDate = (rng, range, days) => addDays(range.start, Math.floor(rng() * days));

// Split `total` across `weights`, last item takes the remainder so the sum is exact
function splitTotal(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  let left = total;
  return weights.map((w, i) => {
    const part = i === weights.length - 1 ? left : Math.round((total * w) / sum);
    left -= part;
    return Math.max(0, part);
  });
}

/* -------------------------------------------------------------------------- */
/*  Row builders (mock)                                                        */
/* -------------------------------------------------------------------------- */

function buildLedger(data, range, rng) {
  const n = data.statuses[0].count; // completed bookings = paid transactions
  if (!n) return [];

  const court = splitTotal(
    data.courtRental,
    Array.from({ length: n }, () => 0.6 + rng()),
  );

  // Only some bookings include equipment rental
  let withEquip = Array.from({ length: n }, (_, i) => i).filter(() => rng() < 0.55);
  if (!withEquip.length && data.equipment > 0) withEquip = [0];
  const equipParts = withEquip.length
    ? splitTotal(
        data.equipment,
        withEquip.map(() => 0.6 + rng()),
      )
    : [];
  const equip = Array(n).fill(0);
  withEquip.forEach((rowIdx, k) => {
    equip[rowIdx] = equipParts[k];
  });

  const rows = court.map((c, i) => ({
    date: randomDate(rng, range, data.days),
    customer: pick(rng, CUSTOMERS),
    court: c,
    equipment: equip[i],
    total: c + equip[i],
  }));

  rows.sort((a, b) => a.date - b.date);
  rows.forEach((r, i) => {
    r.ref = `BK-${String(1000 + i)}`;
  });
  return rows.reverse();
}

function buildUtilization(data, range, rng) {
  const rows = [];
  data.slots.forEach((slot, slotIdx) => {
    const [lo, hi] = SLOT_HOURS[slotIdx] || [6, 22];
    let left = slot.hrs;
    while (left > 0) {
      const dur = Math.min(1 + Math.floor(rng() * 3), left, hi - lo);
      const startHour = lo + Math.floor(rng() * (hi - lo - dur + 1));
      rows.push({
        date: randomDate(rng, range, data.days),
        slotColor: slot.color,
        slotLabel: slot.label,
        time: timeRange(startHour, dur),
        court: `Court ${1 + Math.floor(rng() * 4)}`,
        customer: pick(rng, CUSTOMERS),
        hours: dur,
      });
      left -= dur;
    }
  });

  rows.sort((a, b) => a.date - b.date);
  rows.forEach((r, i) => {
    r.ref = `BK-${String(2000 + i)}`;
  });
  return rows.reverse();
}

function buildAudit(data, range, rng) {
  const [, cancelled, noShow] = data.statuses;
  const make = (count, status) =>
    Array.from({ length: count }, () => {
      const slotIdx = Math.floor(rng() * SLOT_HOURS.length);
      const [lo, hi] = SLOT_HOURS[slotIdx];
      const dur = 1 + Math.floor(rng() * 2);
      const startHour = lo + Math.floor(rng() * (hi - lo - dur + 1));
      return {
        date: randomDate(rng, range, data.days),
        customer: pick(rng, CUSTOMERS),
        time: timeRange(startHour, dur),
        status,
      };
    });

  const rows = [...make(cancelled.count, 'Cancelled'), ...make(noShow.count, 'No-Show')];
  rows.sort((a, b) => a.date - b.date);
  rows.forEach((r, i) => {
    r.ref = `BK-${String(3000 + i)}`;
  });
  return rows.reverse();
}

/* -------------------------------------------------------------------------- */
/*  Table                                                                      */
/* -------------------------------------------------------------------------- */

// columns: [{ key, label, align?: 'right', className?, render?: (row) => node }]
function DataTable({ columns, rows, footer, minWidth = 640 }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-xs" style={{ minWidth }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              scope="col"
              className={`sticky top-0 z-10 bg-[#eceed8] border-b border-[#121212] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#5f5e5e] whitespace-nowrap ${
                c.align === 'right' ? 'text-right' : 'text-left'
              }`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-10 text-center text-xs text-[#6b7280]">
              No records for this period.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.ref} className="hover:bg-neutral-50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`border-b border-[#c4c9ac] px-3 py-2.5 text-[#121212] whitespace-nowrap ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  } ${c.className || ''}`}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      {footer && rows.length > 0 && (
        <tfoot>
          <tr>
            {footer.map((cell, i) => (
              <td
                key={i}
                className={`sticky bottom-0 z-10 bg-white border-t border-[#121212] px-3 py-2.5 text-xs font-bold text-[#121212] whitespace-nowrap ${
                  columns[i]?.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}

const refCell = (r) => <span className="font-semibold">{r.ref}</span>;

/* -------------------------------------------------------------------------- */
/*  Variant views                                                              */
/* -------------------------------------------------------------------------- */

function RevenueView({ data, range, rng }) {
  const rows = useMemo(() => buildLedger(data, range, rng), [data, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const columns = [
    { key: 'ref', label: 'REF #', render: refCell },
    { key: 'date', label: 'DATE', render: (r) => fmtDate(r.date) },
    { key: 'customer', label: 'CUSTOMER NAME' },
    { key: 'court', label: 'COURT FEE', align: 'right', render: (r) => peso(r.court) },
    {
      key: 'equipment',
      label: 'EQUIPMENT',
      align: 'right',
      render: (r) => (r.equipment ? peso(r.equipment) : <span className="text-[#6b7280]">—</span>),
    },
    { key: 'total', label: 'TOTAL PAID', align: 'right', className: 'font-bold', render: (r) => peso(r.total) },
  ];
  const footer = ['', '', `${rows.length} transactions`, peso(data.courtRental), peso(data.equipment), peso(data.revenue)];

  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-[#c4c9ac]">
      <DataTable columns={columns} rows={rows} footer={footer} />
    </div>
  );
}

function UtilizationView({ data, range, rng }) {
  const allRows = useMemo(() => buildUtilization(data, range, rng), [data, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = allRows.slice(0, UTILIZATION_ROW_LIMIT);

  const peakSlot = data.slots.find((s) => s.peak);
  const peakHrs = peakSlot ? peakSlot.hrs : 0;
  const offPeakHrs = data.booked - peakHrs;
  const pctOf = (n) => (data.booked ? Math.round((n / data.booked) * 100) : 0);

  const summary = [
    {
      label: 'Booked vs. available',
      value: `${data.booked} / ${data.available} hrs`,
      note: `${data.bookedPct}% occupied`,
    },
    {
      label: 'Peak',
      value: `${peakHrs} hrs`,
      note: peakSlot ? `${peakSlot.label} · ${pctOf(peakHrs)}% of booked` : 'No bookings',
    },
    {
      label: 'Off-peak',
      value: `${offPeakHrs} hrs`,
      note: `${pctOf(offPeakHrs)}% of booked`,
    },
  ];

  const columns = [
    { key: 'ref', label: 'REF #', render: refCell },
    { key: 'date', label: 'DATE', render: (r) => fmtDate(r.date) },
    {
      key: 'time',
      label: 'TIME SLOT',
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.slotColor }} />
          {r.time}
        </span>
      ),
    },
    { key: 'court', label: 'COURT' },
    { key: 'customer', label: 'CUSTOMER NAME' },
    { key: 'hours', label: 'HOURS', align: 'right', className: 'font-bold', render: (r) => `${r.hours} hr${r.hours > 1 ? 's' : ''}` },
  ];

  return (
    <>
      {/* Compact summary strip */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#c4c9ac] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#c4c9ac]">
        {summary.map((s) => (
          <div key={s.label} className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5f5e5e]">{s.label}</p>
            <p className="mt-0.5 text-sm font-bold text-[#121212]">
              {s.value} <span className="text-[11px] font-normal text-[#6b7280]">{s.note}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-[#c4c9ac]">
        <DataTable columns={columns} rows={rows} minWidth={720} />
      </div>
      {allRows.length > rows.length && (
        <p className="shrink-0 -mt-2 text-[11px] text-[#6b7280]">
          Showing the latest {rows.length} of {allRows.length} bookings.
        </p>
      )}
    </>
  );
}

const STATUS_STYLES = {
  Cancelled: 'bg-[#fef3c7] text-[#92400e]',
  'No-Show': 'bg-[#fee2e2] text-[#991b1b]',
};

function StatusView({ data, range, rng }) {
  const rows = useMemo(() => buildAudit(data, range, rng), [data, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const columns = [
    { key: 'ref', label: 'REF #', render: refCell },
    { key: 'date', label: 'DATE', render: (r) => fmtDate(r.date) },
    { key: 'customer', label: 'CUSTOMER NAME' },
    { key: 'time', label: 'TIME SLOT' },
    {
      key: 'status',
      label: 'STATUS',
      render: (r) => (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-[#c4c9ac]">
      <DataTable columns={columns} rows={rows} minWidth={600} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal shell                                                                */
/* -------------------------------------------------------------------------- */

const VARIANTS = {
  revenue: {
    title: 'Revenue overview',
    View: RevenueView,
    subtitle: (d) => `${d.statuses[0].count} paid transactions · ${peso(d.revenue)} total`,
  },
  utilization: {
    title: 'Court utilization',
    View: UtilizationView,
    subtitle: (d) => `${d.booked} of ${d.available} court hours booked`,
  },
  status: {
    title: 'Booking status',
    View: StatusView,
    subtitle: (d) =>
      `${d.statuses[1].count} cancelled · ${d.statuses[2].count} no-show · ${d.cancellationRate}% cancellation rate`,
  },
};

export default function ReportModal({ variant, onClose, range, data }) {
  const closeRef = useRef(null);
  const config = variant ? VARIANTS[variant] : null;
  const isOpen = !!config;

  // Escape to close, lock page scroll, focus the close button, restore focus after
  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;
  const { title, subtitle, View } = config;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-[2px] print:hidden"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-[#121212] bg-white shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 border-b border-[#121212]">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#121212] leading-tight">{title}</h2>
            <p className="mt-0.5 text-[11px] text-[#5f5e5e] leading-relaxed">
              {fmtDate(range.start)} – {fmtDate(range.end)} · {subtitle(data)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg border border-[#121212] bg-white text-[#121212] hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-[#121212] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: tables scroll internally, header and footer stay put */}
        <div className="flex-1 min-h-0 flex flex-col gap-3 p-4 sm:p-5">
          <View data={data} range={range} rng={makeRng(range)} />
        </div>
      </div>
    </div>,
    document.body,
  );
}