"use client";

/* -------------------------------------------------------------------------
 * SettingsPageFaqs.jsx — everything for the FAQs & Guidelines settings tab
 * (data + storage, add/edit modal, upload modal, and the tab itself).
 * Default export = the tab. Named exports are for the public FAQs page.
 * ------------------------------------------------------------------------- */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PopupSettingsSaveConfirmation from "./PopupSettingsSaveConfirmation";
import PopupSettingsResetConfirmation from "./PopupSettingsResetConfirmation";
import {
  X, Bold, Italic, Upload, AlertTriangle, Plus, MoreHorizontal, RotateCw,
  Trash2, Copy, ChevronLeft, ChevronRight, HelpCircle, Search, Eye, CheckCircle,
} from "lucide-react";

const LIME = "#ccff00";

/* ======================= Data & storage ======================= */
/* -------------------------------------------------------------------------
 * FAQ data + localStorage helpers.
 * Shared by the admin Settings page and the public FAQs page.
 * ------------------------------------------------------------------------- */

export const FAQ_CATEGORIES = [
  { id: "GENERAL", label: "General FAQs", description: "Court setup, amenities, facility features & hospitality" },
  { id: "BOOKING", label: "Booking Guidelines", description: "Reservation procedures, policies & requirements" },
  { id: "RAIN", label: "Rain Policy", description: "Weather protocols, reschedules & credits" },
  { id: "LIABILITY", label: "Liability Notice", description: "Safety, conduct, and player responsibility rules" },
];

// rows: [question, answer, fullSpan?]
const seed = (category, prefix, rows) =>
  rows.map(([q, a, fullSpan], i) => ({
    id: `${prefix}-${i + 1}`,
    num: String(i + 1).padStart(2, "0"),
    category,
    q,
    a,
    ...(fullSpan ? { fullSpan: true } : {}),
    order: i + 1,
    updatedAt: "2026-10-15",
  }));

export const INITIAL_FAQS = [
  ...seed("GENERAL", "gen", [
    ["How many courts do you have?", "We currently have **1 covered pickleball court.**"],
    ["Is the court covered?", "Yes, our court is an **open-air outdoor court** with protective shelter coverage."],
    ["Do you have parking?", "Yes, street parking is available for approximately **2–3 vehicles.**"],
    ["Do you have toilets?", "Yes, restrooms are available for guests. *(Shower facilities are not available.)*"],
    ["Can we bring outside food and drinks?", "No, outside food and beverages aren't allowed. **D'Rafael's Café** is on-site to serve fresh food, drinks, and snacks."],
    ["Do you have coaches available?", "Yes — private coaching for advanced training, plus special **Learn to Play** sessions tailored for first-timers!"],
    ["Can we bring pets?", "Yes! Pets are welcome as long as they **wear diapers** and stay strictly under their owner's supervision."],
    ["What shoes are allowed?", "Tennis or pickleball shoes are highly recommended. Regular rubber shoes are allowed but not recommended. Slippers or crocs are strictly not allowed."],
    ["Are kids allowed?", "Yes! Children are welcome and are included in the overall court head count for all court bookings.", true],
  ]),
  ...seed("BOOKING", "book", [
    ["Payment Policy", "Full payment is required to confirm your court reservation. Bookings are only officially confirmed after payment has been received."],
    ["Advance Booking", "Walk-ins are not recommended. We encourage guests to book in advance to ensure the court is available on your preferred date and time."],
  ]),
  ...seed("RAIN", "rain", [
    ["Reschedule Option", "You can reschedule your booking to any date and time you prefer, subject to court availability."],
    ["Open Play Reschedule", "You may move to the next Open Play schedule if available, or keep your credit for future use."],
    ["Court Rental Partial Play", "More than 30 minutes played is counted as a full hour. Less than 30 minutes is credited as a half-hour toward rescheduling."],
    ["Open Play Partial Play", "If you've played more than 2 hours, the session is considered full. Less than 2 hours, you may reschedule to the next available Open Play."],
  ]),
  ...seed("LIABILITY", "liab", [
    ["Assumption of Risk", "Pickleball is an active physical activity and carries an inherent risk of injury. By booking and using the court, players acknowledge and accept this risk."],
    ["Personal Belongings", "Saranay Pickleball Court is not responsible for lost, damaged, or stolen personal items brought onto the premises."],
    ["Player Conduct", "Players are expected to follow court rules and staff instructions at all times. The management reserves the right to refuse service for unsafe or disruptive conduct."],
    ["Equipment Use", "Rental equipment should be used properly and returned in the condition it was provided. Damage beyond normal wear may be charged accordingly."],
    ["Minors & Guardianship", "Guests bringing minors are strictly responsible for their supervision throughout the entire duration of the booking.", true],
  ]),
];

const STORAGE_KEY = "saranay_pickleball_faqs_v1";

export function loadStoredFaqs() {
  if (typeof window === "undefined") return INITIAL_FAQS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FAQS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error("Failed to load FAQs from localStorage", e);
  }
  return INITIAL_FAQS;
}

export function saveStoredFaqs(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("faqs_updated", { detail: items }));
  } catch (e) {
    console.error("Failed to save FAQs to localStorage", e);
  }
}

export function resetStoredFaqs() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("faqs_updated", { detail: INITIAL_FAQS }));
  }
  return INITIAL_FAQS;
}

/** Re-number items (01, 02, …) within each category, following list order. */
export function renumberFaqs(list) {
  const counters = {};
  return list.map((item) => {
    counters[item.category] = (counters[item.category] || 0) + 1;
    const n = counters[item.category];
    return { ...item, num: String(n).padStart(2, "0"), order: n };
  });
}

/** Splits "**bold**" and "*italic*" markers into renderable segments. */
export function faqSegments(text = "") {
  return String(text)
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((p) =>
      p.startsWith("**") && p.endsWith("**") && p.length > 4
        ? { type: "bold", text: p.slice(2, -2) }
        : p.startsWith("*") && p.endsWith("*") && p.length > 2
        ? { type: "italic", text: p.slice(1, -1) }
        : { type: "text", text: p }
    );
}

/* ======================= Small shared UI (same look as SettingsPage) ======================= */
const inputBase =
  "w-full h-[34px] sm:h-[36px] rounded-xl border border-[#121212] bg-[#ffffff] px-3.5 py-1.5 text-xs text-[#121212] placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all";

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#121212]" strokeWidth={1.5} />
      <div>
        <h2 className="text-sm font-bold text-[#121212] leading-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-[#5f5e5e]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-[34px] sm:h-[36px] min-w-[62px] cursor-pointer rounded-lg border border-[#121212] px-4 text-xs font-medium text-[#121212]/80 transition-colors ${
        active
          ? "bg-[#ccff00] hover:brightness-95"
          : "bg-[#d9d9d9] hover:bg-[#cfcfcf]"
      }`}
    >
      {children}
    </button>
  );
}

function ActionBar({ onReset, onSave, saveLabel, section }) {
  const [confirm, setConfirm] = useState(null); // "save" | "reset" | null
  const close = () => setConfirm(null);
  return (
    <>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setConfirm("reset")}
          className="rounded-xl border border-[#121212] bg-[#ffffff] px-4 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setConfirm("save")}
          style={{ backgroundColor: LIME }}
          className="rounded-xl border border-[#121212] px-4 py-1.5 text-xs font-bold text-[#121212] hover:brightness-95 transition"
        >
          {saveLabel}
        </button>
      </div>

      <PopupSettingsResetConfirmation
        isOpen={confirm === "reset"}
        sectionName={section}
        onClose={close}
        onConfirm={onReset}
      />
      <PopupSettingsSaveConfirmation
        isOpen={confirm === "save"}
        sectionName={section}
        onClose={close}
        onConfirm={onSave}
      />
    </>
  );
}

// onDuplicate is optional: the menu shows a "Duplicate" item only when it's passed.
function RowActionMenu({ label, onEdit, onDelete, onDuplicate }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: undefined, bottom: undefined });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const MENU_W = 144;
  const MENU_H = onDuplicate ? 148 : 116;

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current.getBoundingClientRect();
    const left = Math.max(8, r.right - MENU_W);
    const openUp = r.bottom + MENU_H + 8 > window.innerHeight;
    setPos(
      openUp
        ? { left, bottom: window.innerHeight - r.top + 6, top: undefined }
        : { left, top: r.bottom + 6, bottom: undefined }
    );
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const itemBase =
    "flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-left transition-colors hover:bg-neutral-100 cursor-pointer";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] hover:bg-neutral-100 cursor-pointer transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, width: MENU_W }}
          className="z-50 overflow-hidden rounded-xl border border-[#121212] bg-[#ffffff] py-1 text-left shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit?.();
            }}
            className={`${itemBase} text-[#121212]`}
          >
            <RotateCw className="h-3.5 w-3.5" /> Edit
          </button>
          {onDuplicate && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDuplicate();
              }}
              className={`${itemBase} text-[#121212]`}
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className={`${itemBase} text-[#121212]`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <div className="my-1 border-t border-[#c4c9ac]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`${itemBase} text-red-600`}
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      )}
    </>
  );
}


/* ======================= Add / Edit modal ======================= */
/** Renders FAQ text with **bold** and *italic* markers. */
export function FaqText({ text }) {
  return faqSegments(text).map((s, i) =>
    s.type === "bold" ? (
      <strong key={i} className="font-bold text-[#141414]">{s.text}</strong>
    ) : s.type === "italic" ? (
      <em key={i}>{s.text}</em>
    ) : (
      <span key={i}>{s.text}</span>
    )
  );
}

const modalInput =
  "w-full rounded-xl border border-[#121212] bg-[#ffffff] px-3.5 py-2 text-xs text-[#121212] placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all";

function FaqFormModal({
  isOpen,
  initialData,
  categoryDefault = "GENERAL",
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({ category: categoryDefault, q: "", a: "", fullSpan: false });
  const [error, setError] = useState("");
  const areaRef = useRef(null);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      category: initialData?.category || categoryDefault,
      q: initialData?.q || "",
      a: initialData?.a || "",
      fullSpan: !!initialData?.fullSpan,
    });
    setError("");
  }, [isOpen, initialData, categoryDefault]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Wraps the selected text in ** or * markers
  const wrap = (marker) => {
    const el = areaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = form.a.slice(s, e) || "text";
    const next = form.a.slice(0, s) + marker + selected + marker + form.a.slice(e);
    setForm((f) => ({ ...f, a: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + marker.length, s + marker.length + selected.length);
    });
  };

  const submit = () => {
    const q = form.q.trim();
    const a = form.a.trim();
    if (!q || !a) return setError("Please fill in both the question and the answer.");
    onSave({
      ...(isEdit ? { id: initialData.id } : {}),
      category: form.category,
      q,
      a,
      fullSpan: form.fullSpan,
    });
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#121212] bg-[#ffffff] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#c4c9ac] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#121212]">{isEdit ? "Edit question" : "Add question"}</h3>
            <p className="mt-0.5 text-[11px] text-[#5f5e5e]">
              Changes appear on the public FAQs page right after saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#5f5e5e]">Category</span>
            <select className={`${modalInput} h-[36px] cursor-pointer`} value={form.category} onChange={set("category")}>
              {FAQ_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#5f5e5e]">Question / title</span>
            <input
              className={`${modalInput} h-[36px]`}
              value={form.q}
              onChange={set("q")}
              placeholder="e.g. Do you have parking?"
            />
          </label>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5f5e5e]">Answer / policy</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Bold (select text first)"
                  onClick={() => wrap("**")}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#121212] hover:bg-neutral-100"
                >
                  <Bold className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Italic (select text first)"
                  onClick={() => wrap("*")}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#121212] hover:bg-neutral-100"
                >
                  <Italic className="h-3 w-3" />
                </button>
              </div>
            </div>
            <textarea
              ref={areaRef}
              rows={5}
              className={`${modalInput} resize-y leading-relaxed`}
              value={form.a}
              onChange={set("a")}
              placeholder="Write the answer… use **double asterisks** for bold."
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#121212]">
            <input
              type="checkbox"
              checked={form.fullSpan}
              onChange={(e) => setForm((f) => ({ ...f, fullSpan: e.target.checked }))}
              className="h-3.5 w-3.5 cursor-pointer accent-[#121212]"
            />
            <span>
              <strong>Wide card</strong> — spans both columns on the public page
            </span>
          </label>

          {/* Live preview */}
          <div>
            <span className="text-[11px] font-semibold text-[#5f5e5e]">Live preview</span>
            <div className="mt-1 flex items-start gap-3 rounded-2xl border border-[#E3DCB8] bg-[#f3f5e0] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#D7E84B] bg-[#F4F9CE] text-xs font-extrabold text-[#556306]">
                {initialData?.num || "•"}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-bold leading-snug text-[#141414]">{form.q || "Your question"}</p>
                <p className="text-xs leading-relaxed text-[#4E4B3E]">
                  {form.a ? <FaqText text={form.a} /> : "Your answer will show here."}
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#121212] bg-[#ffffff] px-4 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            style={{ backgroundColor: "#ccff00" }}
            className="cursor-pointer rounded-xl border border-[#121212] px-4 py-1.5 text-xs font-bold text-[#121212] hover:brightness-95"
          >
            {isEdit ? "Save changes" : "Add question"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ======================= Upload modal ======================= */
/* ------------------------------ File parsing ------------------------------ */
const norm = (k) => String(k).toLowerCase().replace(/[^a-z]/g, "");
const pick = (rec, names) => {
  for (const n of names) if (rec[n] !== undefined && rec[n] !== null) return rec[n];
  return "";
};

function resolveCategory(value) {
  const s = String(value || "").trim().toLowerCase();
  if (!s) return null;
  const match = FAQ_CATEGORIES.find(
    (c) => c.id.toLowerCase() === s || c.label.toLowerCase() === s || c.label.toLowerCase().startsWith(s)
  );
  return match ? match.id : null;
}

// Small CSV parser (handles quotes, commas and line breaks inside quotes)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = ""; rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

function toRecords(text, filename) {
  const clean = text.replace(/^\uFEFF/, "");
  if (/\.json$/i.test(filename)) {
    const data = JSON.parse(clean);
    const arr = Array.isArray(data) ? data : data?.faqs;
    if (!Array.isArray(arr)) throw new Error("JSON must be an array of FAQ objects.");
    return arr.map((o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [norm(k), v])));
  }
  const [head, ...rest] = parseCsv(clean);
  if (!head) throw new Error("The file is empty.");
  const keys = head.map(norm);
  return rest.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
}

function buildItems(records) {
  const items = [];
  const errors = [];
  const today = new Date().toISOString().split("T")[0];
  records.forEach((r, i) => {
    const n = i + 1;
    const category = resolveCategory(pick(r, ["category", "cat"]));
    const q = String(pick(r, ["q", "question", "title"])).trim();
    const a = String(pick(r, ["a", "answer", "summary"])).trim();
    if (!category) return errors.push(`Row ${n}: unknown or missing category`);
    if (!q || !a) return errors.push(`Row ${n}: question and answer are required`);
    const wide = String(pick(r, ["fullspan", "wide"])).toLowerCase();
    items.push({
      id: `faq-${Date.now()}-${i}`,
      category,
      q,
      a,
      fullSpan: ["true", "yes", "y", "1"].includes(wide),
      updatedAt: today,
    });
  });
  return { items, errors };
}

/* -------------------------------- Component ------------------------------- */
function FaqUploadModal({ isOpen, onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null); // { items, errors }
  const [fatal, setFatal] = useState("");
  const [mode, setMode] = useState("append");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) return;
    setFileName(""); setResult(null); setFatal(""); setMode("append"); setDragging(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setResult(buildItems(toRecords(text, file.name)));
      setFatal("");
    } catch (e) {
      setResult(null);
      setFatal(e.message || "Could not read this file.");
    }
  };

  const catLabel = (id) => FAQ_CATEGORIES.find((c) => c.id === id)?.label || id;
  const validCount = result?.items.length || 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#121212] bg-[#ffffff] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#c4c9ac] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#121212]">Upload infos</h3>
            <p className="mt-0.5 text-[11px] text-[#5f5e5e]">
              Import FAQs and guidelines in bulk from a CSV or JSON file.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#121212]/50 px-4 py-7 text-center transition-colors ${
              dragging ? "bg-[#f3f5e0]" : "hover:bg-neutral-50"
            }`}
          >
            <Upload className="h-5 w-5 text-[#121212]" />
            <p className="text-xs font-semibold text-[#121212]">
              {fileName || "Click to choose a file, or drag it here"}
            </p>
            <p className="text-[11px] text-[#5f5e5e]">
              .csv or .json · columns: Category, Question, Answer (FullSpan optional)
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {fatal && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" /> {fatal}
            </p>
          )}

          {/* Result summary + preview */}
          {result && (
            <div className="space-y-3">
              <p className="text-xs text-[#121212]">
                <span className="font-bold">{validCount}</span> FAQ{validCount === 1 ? "" : "s"} ready to import
                {result.errors.length > 0 && (
                  <span className="text-red-600"> · {result.errors.length} skipped</span>
                )}
              </p>

              {validCount > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#121212]/20">
                  <table className="w-full text-left text-[11px]">
                    <tbody>
                      {result.items.slice(0, 5).map((it) => (
                        <tr key={it.id} className="border-b border-[#c4c9ac] last:border-0">
                          <td className="whitespace-nowrap px-3 py-1.5 font-bold text-[#444933]">{catLabel(it.category)}</td>
                          <td className="px-3 py-1.5 text-[#121212]">{it.q}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {validCount > 5 && (
                    <p className="bg-[#f9faf2] px-3 py-1 text-[10px] text-[#5f5e5e]">+ {validCount - 5} more</p>
                  )}
                </div>
              )}

              {result.errors.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-red-600">
                  {result.errors.slice(0, 5).map((er) => <li key={er}>{er}</li>)}
                  {result.errors.length > 5 && <li>+ {result.errors.length - 5} more</li>}
                </ul>
              )}

              {/* Import mode */}
              <div className="flex flex-wrap gap-4 text-xs text-[#121212]">
                {[
                  ["append", "Add to existing FAQs"],
                  ["replace", "Replace all existing FAQs"],
                ].map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="faq-import-mode"
                      checked={mode === value}
                      onChange={() => setMode(value)}
                      className="cursor-pointer accent-[#121212]"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {mode === "replace" && (
                <p className="text-[11px] font-semibold text-red-600">
                  This will delete every current FAQ and use only the file's contents.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#121212] bg-[#ffffff] px-4 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={validCount === 0}
            onClick={() => {
              onImport(result.items, mode);
              onClose();
            }}
            style={{ backgroundColor: "#ccff00" }}
            className="cursor-pointer rounded-xl border border-[#121212] px-4 py-1.5 text-xs font-bold text-[#121212] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Import {validCount > 0 ? `${validCount} FAQ${validCount === 1 ? "" : "s"}` : ""}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ======================= FAQs tab ======================= */
const FAQS_PER_PAGE = 8;

// Prev / numbered / next buttons (same look as the Availability pagination)
function Pagination({ page, totalPages, onChange }) {
  const nav = "p-1 rounded-md border border-[#121212] transition-colors";
  const off = "opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300";
  const on = "hover:bg-neutral-100 text-[#121212] cursor-pointer";
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${nav} ${page <= 1 ? off : on}`}
        title="Previous page"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      {Array.from({ length: totalPages }).map((_, idx) => {
        const n = idx + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-w-[28px] h-7 px-1 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              page === n
                ? "bg-[#121212] text-[#ccff00] font-bold shadow-2xs"
                : "border border-[#121212]/30 text-[#121212] hover:bg-neutral-100"
            }`}
          >
            {n}
          </button>
        );
      })}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${nav} ${page >= totalPages ? off : on}`}
        title="Next page"
      >
        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
}

function FaqsTab() {
  const [faqs, setFaqs] = useState(() => loadStoredFaqs());
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFaq, setPreviewFaq] = useState(null);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  // Stay in sync if another component updates the FAQs
  useEffect(() => {
    const onSync = (e) => e.detail && setFaqs(e.detail);
    window.addEventListener("faqs_updated", onSync);
    return () => {
      window.removeEventListener("faqs_updated", onSync);
      clearTimeout(noticeTimer.current);
    };
  }, []);

  const toast = (msg) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  };

  // Re-number, store and publish to the public page in one step
  const commit = (list, msg) => {
    const next = renumberFaqs(list);
    setFaqs(next);
    saveStoredFaqs(next);
    if (msg) toast(msg);
  };

  const today = () => new Date().toISOString().split("T")[0];
  const categoryLabel = (id) => FAQ_CATEGORIES.find((c) => c.id === id)?.label || id;

  const categoryCounts = useMemo(() => {
    const counts = { ALL: faqs.length };
    FAQ_CATEGORIES.forEach((c) => (counts[c.id] = 0));
    faqs.forEach((f) => (counts[f.category] = (counts[f.category] || 0) + 1));
    return counts;
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((f) => {
      if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.num.toLowerCase().includes(q) ||
        categoryLabel(f.category).toLowerCase().includes(q)
      );
    });
  }, [faqs, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / FAQS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * FAQS_PER_PAGE;
  const paginatedFaqs = filteredFaqs.slice(startIdx, startIdx + FAQS_PER_PAGE);

  /* ---- CRUD ---- */
  const handleSaveFaq = (data) => {
    if (data.id) {
      commit(
        faqs.map((f) => (f.id === data.id ? { ...f, ...data, updatedAt: today() } : f)),
        "FAQ updated successfully!"
      );
    } else {
      commit([...faqs, { ...data, id: `faq-${Date.now()}`, updatedAt: today() }], "New FAQ added!");
    }
  };

  const handleDeleteFaq = (id) => commit(faqs.filter((f) => f.id !== id), "FAQ removed.");

  const handleDuplicateFaq = (item) => {
    const list = [...faqs];
    const idx = list.findIndex((f) => f.id === item.id);
    list.splice(idx + 1, 0, { ...item, id: `faq-${Date.now()}`, q: `${item.q} (Copy)`, updatedAt: today() });
    commit(list, "FAQ duplicated.");
  };

  const handleImportFaqs = (imported, mode) =>
    commit(
      mode === "replace" ? imported : [...faqs, ...imported],
      `Imported ${imported.length} FAQs (${mode === "replace" ? "replaced all" : "added to existing"}).`
    );

  const handleResetToDefault = () => {
    setFaqs(resetStoredFaqs());
    toast("FAQs reset to the default list.");
  };

  const plain = (text) => text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
  const openForm = (faq = null) => {
    setEditingFaq(faq);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-[#121212] bg-[#ccff00] px-4 py-2 text-xs font-bold text-[#121212] shadow-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header + primary actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle
          icon={HelpCircle}
          title="Court FAQs & Guidelines"
          subtitle="Manage, edit, or bulk upload the court rules, booking policies, and player guidelines."
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#121212] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Upload className="h-3 w-3 stroke-[2.2]" />
            <span>Upload infos</span>
          </button>

          <button
            type="button"
            onClick={() => openForm()}
            style={{ backgroundColor: LIME }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#121212] px-3.5 py-1.5 text-xs font-bold text-[#121212] hover:brightness-95 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            active={selectedCategory === "ALL"}
            onClick={() => {
              setSelectedCategory("ALL");
              setPage(1);
            }}
          >
            All Questions ({categoryCounts.ALL})
          </Chip>
          {FAQ_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              active={selectedCategory === cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
            >
              {cat.label} ({categoryCounts[cat.id] || 0})
            </Chip>
          ))}
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5f5e5e]" />
          <input
            type="text"
            placeholder="Search FAQs & keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className={`${inputBase} pl-8`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-[11px] font-semibold text-[#5f5e5e] hover:text-[#121212] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#121212]/20">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead>
            <tr className="border-b border-[#121212] bg-[#f9faf2]">
              {[
                ["No.", "w-14"],
                ["Category", "w-36"],
                ["Question / Title", ""],
                ["Answer / Policy Summary", ""],
                ["Action", "text-right w-24"],
              ].map(([h, cls]) => (
                <th
                  key={h}
                  className={`py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] ${cls}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedFaqs.map((faq) => (
              <tr key={faq.id} className="border-b border-[#c4c9ac] hover:bg-neutral-50/80 transition-colors">
                <td className="py-2.5 px-3 sm:px-4">
                  <span
                    style={{ backgroundColor: LIME }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-[#121212] text-[10px] font-extrabold text-[#121212]"
                  >
                    {faq.num}
                  </span>
                </td>
                <td className="py-2.5 px-3 sm:px-4">
                  <span className="inline-block rounded-md border border-[#121212]/40 bg-[#f3f5e0] px-2 py-0.5 text-[10px] font-bold text-[#444933] whitespace-nowrap">
                    {categoryLabel(faq.category)}
                  </span>
                </td>
                <td className="py-2.5 px-3 sm:px-4 font-semibold text-[#121212]">
                  <div className="flex items-center gap-1.5">
                    <span>{faq.q}</span>
                    {faq.fullSpan && (
                      <span className="text-[9px] font-bold px-1.5 rounded bg-neutral-100 border border-neutral-300 text-neutral-600">
                        Wide
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 sm:px-4 text-xs text-[#5f5e5e] max-w-xs sm:max-w-md">
                  <p className="line-clamp-2 leading-relaxed">{plain(faq.a)}</p>
                </td>
                <td className="py-2.5 px-3 sm:px-4 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      title="Quick preview card"
                      onClick={() => setPreviewFaq(faq)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] hover:bg-neutral-100 cursor-pointer transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <RowActionMenu
                      label={faq.q}
                      onEdit={() => openForm(faq)}
                      onDuplicate={() => handleDuplicateFaq(faq)}
                      onDelete={() => handleDeleteFaq(faq.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredFaqs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-xs text-[#5f5e5e]">
                  <p className="font-semibold text-neutral-700">No FAQs found matching your criteria.</p>
                  <p className="text-[11px] mt-1 text-neutral-500">
                    Try another keyword, or use “Add Question” / “Upload infos” to add items.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
        <div>
          Showing{" "}
          <span className="font-bold text-[#121212]">{filteredFaqs.length === 0 ? 0 : startIdx + 1}</span> to{" "}
          <span className="font-bold text-[#121212]">{Math.min(startIdx + FAQS_PER_PAGE, filteredFaqs.length)}</span> of{" "}
          <span className="font-bold text-[#121212]">{filteredFaqs.length}</span> FAQ items
          {selectedCategory !== "ALL" && ` in ${categoryLabel(selectedCategory)}`}
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Quick preview */}
      {previewFaq && createPortal(
        <div
          onClick={() => setPreviewFaq(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-[#121212] bg-[#f3f5e0] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#c4c9ac]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#556306]">
                Guest card preview • {categoryLabel(previewFaq.category)}
              </span>
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewFaq(null)}
                className="h-7 w-7 rounded-lg border border-[#121212] bg-white flex items-center justify-center text-[#121212] hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-white border border-[#E3DCB8] shadow-sm flex items-start gap-4">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-[#D7E84B] bg-[#F4F9CE] text-sm font-extrabold text-[#556306]">
                {previewFaq.num}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-base leading-snug text-[#141414]">{previewFaq.q}</h3>
                <p className="text-sm leading-relaxed text-[#4E4B3E]">
                  <FaqText text={previewFaq.a} />
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = previewFaq;
                  setPreviewFaq(null);
                  openForm(target);
                }}
                className="rounded-xl border border-[#121212] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 cursor-pointer"
              >
                Edit this question
              </button>
              <button
                type="button"
                onClick={() => setPreviewFaq(null)}
                className="rounded-xl border border-[#121212] bg-[#ccff00] px-4 py-1.5 text-xs font-bold text-[#121212] cursor-pointer"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <FaqFormModal
        isOpen={isFormOpen}
        initialData={editingFaq}
        categoryDefault={selectedCategory === "ALL" ? "GENERAL" : selectedCategory}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFaq(null);
        }}
        onSave={handleSaveFaq}
      />

      <FaqUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={handleImportFaqs}
      />

      <ActionBar
        saveLabel="Save FAQ changes"
        section="FAQs & guidelines"
        onReset={handleResetToDefault}
        onSave={() => {
          saveStoredFaqs(faqs);
          toast("All FAQ changes saved!");
        }}
      />
    </div>
  );
}


export default FaqsTab;