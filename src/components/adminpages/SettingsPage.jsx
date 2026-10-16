"use client";

import { useEffect, useRef, useState } from "react";
import SettingsPageGalleryModal from "./SettingsPageGalleryModal";
import SettingsPageAddUnavailableSched from "./SettingsPageAddUnavailableSched";
import SettingsPageEditUnavailableSched from "./SettingsPageEditUnavailableSched";
import PopupSettingsSaveConfirmation from "./PopupSettingsSaveConfirmation";
import PopupSettingsResetConfirmation from "./PopupSettingsResetConfirmation";
import SettingsPageFaqs from "./SettingsPageFaqs";
import {
  Building2,
  Image as ImageIcon,
  Tag,
  Clock,
  CalendarX,
  Upload,
  Images,
  Plus,
  X,
  MoreHorizontal,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ----------------------------- Design tokens ----------------------------- */
const LIME = "#ccff00";
const PREVIEW_COUNT = 4; // photos shown in the settings page before "+N more"
const INK = "#121212";

/* ------------------------------ Small pieces ----------------------------- */
const inputBase =
  "w-full h-[34px] sm:h-[36px] rounded-xl border border-[#121212] bg-[#ffffff] px-3.5 py-1.5 text-xs text-[#121212] placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all";

function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] font-semibold text-[#5f5e5e]">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ label, className, ...props }) {
  return (
    <Field label={label} className={className}>
      <input className={inputBase} {...props} />
    </Field>
  );
}

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

function SubHeading({ children }) {
  return (
    <h3 className="mb-2 border-b border-[#c4c9ac] pb-1.5 text-xs font-bold text-[#121212]">
      {children}
    </h3>
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

/* ------------------------------ Tab: Business ---------------------------- */
const INITIAL_BUSINESS = {
  name: "Saranay Pickleball Court",
  facebook: "facebook.com/saranaypickleball",
  address: "Saranay Homes, Block 5 Lot 13 Saranay Road, Bagumbong, North Caloocan",
  phonePrimary: "0921 000 8712",
  phoneSecondary: "0960 000 0000",
};

function BusinessTab() {
  const [form, setForm] = useState(INITIAL_BUSINESS);
  const [gallery, setGallery] = useState([]); // starts empty
  const [banner, setBanner] = useState(null); // starts empty
  const uploadInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const addGalleryImages = (files) =>
    setGallery((g) => [
      ...g,
      ...files.map((file, i) => ({
        id: Date.now() + i,
        src: URL.createObjectURL(file),
      })),
    ]);

  const replaceGalleryImage = (id, file) =>
    setGallery((g) =>
      g.map((img) => (img.id === id ? { ...img, src: URL.createObjectURL(file) } : img))
    );

  const handleUploadChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) addGalleryImages(files);
    e.target.value = "";
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setBanner({ id: Date.now(), src: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const removeGalleryImage = (id) =>
    setGallery((g) => g.filter((img) => img.id !== id));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Business information */}
      <section className="space-y-3">
        <SectionTitle icon={Building2} title="Business information" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextInput label="Business name" value={form.name} onChange={set("name")} />
          <TextInput
            label="Facebook page / contact link"
            value={form.facebook}
            onChange={set("facebook")}
          />
          <TextInput
            label="Business address"
            value={form.address}
            onChange={set("address")}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Contact number (primary)"
              value={form.phonePrimary}
              onChange={set("phonePrimary")}
            />
            <TextInput
              label="Contact number (secondary)"
              value={form.phoneSecondary}
              onChange={set("phoneSecondary")}
            />
          </div>
        </div>
      </section>

      {/* Website images & branding */}
      <section className="space-y-4">
        <SectionTitle icon={ImageIcon} title="Website images & branding" />

        {/* Logo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#121212] bg-[#121212] text-[10px] font-bold text-[#ccff00]">
              LOGO
            </div>
            <div>
              <p className="text-xs font-bold text-[#121212]">Current logo</p>
              <p className="text-[11px] text-[#5f5e5e]">
                Uploaded logo.png, 512×512
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[#121212] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
          >
            Change logo
          </button>
        </div>

        {/* Gallery */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#5f5e5e]">
              Gallery photos — {gallery.length} {gallery.length === 1 ? "photo" : "photos"} shown on the public landing page
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-xl border border-[#121212] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
              >
                <Upload className="h-3 w-3" /> Upload new image
              </button>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl border border-[#121212] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
              >
                <Images className="h-3 w-3" /> View all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, PREVIEW_COUNT).map((img, index) => {
              const isLastPreview = index === PREVIEW_COUNT - 1;
              const hiddenCount = gallery.length - PREVIEW_COUNT;
              const showMore = isLastPreview && hiddenCount > 0;

              return (
                <ImageTile
                  key={img.id}
                  src={img.src}
                  moreCount={showMore ? hiddenCount : 0}
                  onMore={() => setIsGalleryOpen(true)}
                  onRemove={() => removeGalleryImage(img.id)}
                />
              );
            })}
            {gallery.length === 0 && (
              <p className="col-span-full py-2 text-xs text-[#5f5e5e]">
                No gallery photos yet. Upload an image to get started.
              </p>
            )}
          </div>
        </div>

        {/* Website banner */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-[#5f5e5e]">
            Website banner — main banner
          </p>
          <div className="w-full max-w-[200px]">
            {banner ? (
              <ImageTile src={banner.src} onRemove={() => setBanner(null)} label="Main banner" />
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex aspect-[4/3] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#121212]/40 text-xs text-[#5f5e5e] hover:bg-neutral-100 transition-colors"
              >
                <Plus className="mr-1 h-3 w-3" /> Add banner
              </button>
            )}
          </div>
        </div>
      </section>

      <ActionBar
        saveLabel="Save changes"
        section="business settings"
        onReset={() => setForm(INITIAL_BUSINESS)}
        onSave={() => console.log("Save business settings", form)}
      />

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUploadChange}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerChange}
      />

      <SettingsPageGalleryModal
        isOpen={isGalleryOpen}
        images={gallery}
        onClose={() => setIsGalleryOpen(false)}
        onAdd={addGalleryImages}
        onReplace={replaceGalleryImage}
        onRemove={removeGalleryImage}
      />
    </div>
  );
}

function ImageTile({ src, onRemove, label, moreCount = 0, onMore }) {
  const hasMore = moreCount > 0;

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#121212] bg-neutral-100">
      <div className={`h-full w-full ${hasMore ? "blur-sm scale-105" : ""}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label || "Gallery"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#6b7280]">
            {label || "No image"}
          </div>
        )}
      </div>

      {label && src && !hasMore && (
        <span className="absolute bottom-1 left-1 rounded bg-[#121212]/80 px-1.5 py-0.5 text-[10px] text-white">
          {label}
        </span>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={onMore}
          aria-label={`View ${moreCount} more photos`}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-[#121212]/40 text-sm font-bold text-white transition-colors hover:bg-[#121212]/50"
        >
          +{moreCount} more
        </button>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Tab: Pricing ----------------------------- */
const INITIAL_PRICING = {
  rates: [
    { id: "day", label: "Day", from: "06:00", to: "18:00", price: "300" },
    { id: "night", label: "Night", from: "18:00", to: "23:00", price: "350" },
  ],
  equipment: [
    { id: "paddle", label: "Paddle", price: "50", stock: "10" },
    { id: "ball", label: "Ball", price: "30", stock: "20" },
  ],
};

function PricingTab() {
  const [pricing, setPricing] = useState(INITIAL_PRICING);

  const updateRow = (group, id, key, value) =>
    setPricing((p) => ({
      ...p,
      [group]: p[group].map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    }));

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Tag}
        title="Court & equipment pricing"
        subtitle="Set rates and equipment prices used when players book."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Court rates */}
        <div>
          <SubHeading>Court rates</SubHeading>
          <div className="space-y-2">
            {pricing.rates.map((r) => (
              <div key={r.id} className="grid grid-cols-[56px_1fr_1fr_90px] items-end gap-2">
                <span
                  className="mb-1.5 rounded-xl border border-[#121212] px-2 py-1.5 text-center text-[11px] font-semibold"
                  style={{ backgroundColor: LIME }}
                >
                  {r.label}
                </span>
                <Field label="From">
                  <input
                    type="time"
                    className={inputBase}
                    value={r.from}
                    onChange={(e) => updateRow("rates", r.id, "from", e.target.value)}
                  />
                </Field>
                <Field label="To">
                  <input
                    type="time"
                    className={inputBase}
                    value={r.to}
                    onChange={(e) => updateRow("rates", r.id, "to", e.target.value)}
                  />
                </Field>
                <Field label="₱ / hour">
                  <input
                    inputMode="numeric"
                    className={inputBase}
                    value={r.price}
                    onChange={(e) => updateRow("rates", r.id, "price", e.target.value)}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <SubHeading>Equipment pricing & availability</SubHeading>
          <div className="space-y-2">
            {pricing.equipment.map((eq) => (
              <div key={eq.id} className="grid grid-cols-[72px_1fr_1fr] items-end gap-2">
                <span
                  className="mb-1.5 rounded-xl border border-[#121212] px-2 py-1.5 text-center text-[11px] font-semibold"
                  style={{ backgroundColor: LIME }}
                >
                  {eq.label}
                </span>
                <Field label="Price (₱)">
                  <input
                    inputMode="numeric"
                    className={inputBase}
                    value={eq.price}
                    onChange={(e) => updateRow("equipment", eq.id, "price", e.target.value)}
                  />
                </Field>
                <Field label="Stock">
                  <input
                    inputMode="numeric"
                    className={inputBase}
                    value={eq.stock}
                    onChange={(e) => updateRow("equipment", eq.id, "stock", e.target.value)}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActionBar
        saveLabel="Save pricing"
        section="pricing"
        onReset={() => setPricing(INITIAL_PRICING)}
        onSave={() => console.log("Save pricing", pricing)}
      />
    </div>
  );
}

/* ----------------------------- Row action menu ---------------------------- */
function RowActionMenu({ label, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: undefined, bottom: undefined });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const MENU_W = 144;
  const MENU_H = 116;

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

/* ---------------------------- Tab: Availability -------------------------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCKED_PER_PAGE = 10;

const INITIAL_AVAILABILITY = {
  operatingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  opening: "06:00",
  closing: "22:00",
  blocked: [
    { id: 1, date: "2026-09-12", startTime: "14:00", endTime: "16:00", reason: "Maintenance" },
    { id: 2, date: "2026-09-20", startTime: "08:00", endTime: "12:00", reason: "Maintenance" },
  ],
};

function formatBlockedDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBlockedTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function AvailabilityTab() {
  const [data, setData] = useState(INITIAL_AVAILABILITY);
  const [isAddBlockedOpen, setIsAddBlockedOpen] = useState(false);
  const [editingBlocked, setEditingBlocked] = useState(null);
  const [blockedPage, setBlockedPage] = useState(1);

  const blockedTotalPages = Math.max(1, Math.ceil(data.blocked.length / BLOCKED_PER_PAGE));
  // Clamp so deleting the last row on the last page doesn't leave an empty page
  const safeBlockedPage = Math.min(blockedPage, blockedTotalPages);
  const blockedStart = (safeBlockedPage - 1) * BLOCKED_PER_PAGE;
  const paginatedBlocked = data.blocked.slice(blockedStart, blockedStart + BLOCKED_PER_PAGE);


  const addBlocked = ({ date, startTime, endTime, reason }) =>
    setData((d) => ({
      ...d,
      blocked: [...d.blocked, { id: Date.now(), date, startTime, endTime, reason }],
    }));

  const updateBlocked = (id, values) =>
    setData((d) => ({
      ...d,
      blocked: d.blocked.map((b) => (b.id === id ? { ...b, ...values } : b)),
    }));

  const toggleDay = (key, day) =>
    setData((d) => ({
      ...d,
      [key]: d[key].includes(day) ? d[key].filter((x) => x !== day) : [...d[key], day],
    }));

  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Operating hours */}
      <section className="space-y-3">
        <SectionTitle
          icon={Clock}
          title="Operating hours"
          subtitle="Set the days and hours your courts are open for booking."
        />
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#5f5e5e]">Days Open</span>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <Chip
                  key={day}
                  active={data.operatingDays.includes(day)}
                  onClick={() => toggleDay("operatingDays", day)}
                >
                  {day}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="Opening time" className="w-full sm:w-[350px]">
            <input type="time" className={inputBase} value={data.opening} onChange={set("opening")} />
          </Field>
          <Field label="Closing time" className="w-full sm:w-[350px]">
            <input type="time" className={inputBase} value={data.closing} onChange={set("closing")} />
          </Field>
        </div>
      </section>

      {/* Court schedule & availability */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <SectionTitle
            icon={CalendarX}
            title="Court schedule & availability"
            subtitle="Block dates or times when courts can't be booked."
          />
          <button
            type="button"
            onClick={() => setIsAddBlockedOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl border border-[#121212] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add blocked date
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#121212]">
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">Date & time</th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">Reason</th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlocked.map((b) => (
                <tr key={b.id} className="border-b border-[#c4c9ac] hover:bg-neutral-50/70 transition-colors">
                  <td className="py-2 px-3 sm:px-4 text-xs text-[#121212]">
                    {formatBlockedDate(b.date)}, {formatBlockedTime(b.startTime)} – {formatBlockedTime(b.endTime)}
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-xs text-[#121212]">{b.reason}</td>
                  <td className="py-2 px-3 sm:px-4 text-right">
                    <RowActionMenu
                      label={formatBlockedDate(b.date)}
                      onEdit={() => setEditingBlocked(b)}
                      onDelete={() =>
                        setData((d) => ({ ...d, blocked: d.blocked.filter((x) => x.id !== b.id) }))
                      }
                    />
                  </td>
                </tr>
              ))}
              {data.blocked.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-xs text-[#5f5e5e]">
                    No blocked dates. All open days are available for booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
          <div>
            Showing{" "}
            <span className="font-bold text-[#121212]">
              {data.blocked.length === 0 ? 0 : blockedStart + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#121212]">
              {Math.min(blockedStart + BLOCKED_PER_PAGE, data.blocked.length)}
            </span>{" "}
            of <span className="font-bold text-[#121212]">{data.blocked.length}</span> blocked dates
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safeBlockedPage <= 1}
              onClick={() => setBlockedPage(safeBlockedPage - 1)}
              className={`p-1 rounded-md border border-[#121212] transition-colors ${
                safeBlockedPage <= 1
                  ? "opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300"
                  : "hover:bg-neutral-100 text-[#121212] cursor-pointer"
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {Array.from({ length: blockedTotalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = safeBlockedPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setBlockedPage(pageNum)}
                  className={`min-w-[28px] h-7 px-1 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#121212] text-[#ccff00] font-bold shadow-2xs"
                      : "border border-[#121212]/30 text-[#121212] hover:bg-neutral-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={safeBlockedPage >= blockedTotalPages}
              onClick={() => setBlockedPage(safeBlockedPage + 1)}
              className={`p-1 rounded-md border border-[#121212] transition-colors ${
                safeBlockedPage >= blockedTotalPages
                  ? "opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300"
                  : "hover:bg-neutral-100 text-[#121212] cursor-pointer"
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
        
      </section>

      <SettingsPageAddUnavailableSched
        openingTime={data.opening}
        closingTime={data.closing}
        isOpen={isAddBlockedOpen}
        onClose={() => setIsAddBlockedOpen(false)}
        onSave={addBlocked}
      />

      <SettingsPageEditUnavailableSched
        isOpen={!!editingBlocked}
        initialValues={editingBlocked}
        openingTime={data.opening}
        closingTime={data.closing}
        onClose={() => setEditingBlocked(null)}
        onSave={(values) => updateBlocked(editingBlocked.id, values)}
      />

      <ActionBar
        saveLabel="Save schedule"
        section="availability"
        onReset={() => setData(INITIAL_AVAILABILITY)}
        onSave={() => console.log("Save schedule", data)}
      />
    </div>
  );
}

/* ------------------------------- Main page ------------------------------- */
const TABS = [
  { id: "business", label: "Business settings", Component: BusinessTab },
  { id: "pricing", label: "Pricing", Component: PricingTab },
  { id: "availability", label: "Availability", Component: AvailabilityTab },
  { id: "faqs", label: "FAQs & Guidelines", Component: SettingsPageFaqs },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const ActiveComponent = TABS.find((t) => t.id === activeTab).Component;

  return (
    <>
      <div
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="w-full flex flex-col space-y-3"
      >
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">
            Settings
          </h1>
          <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
            Manage your venue details, operating hours, and basic system configurations.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Settings sections"
          className="inline-flex w-full sm:w-auto self-start overflow-hidden rounded-xl border border-[#121212] bg-[#ffffff]"
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-[#121212] text-[#ccff00] font-bold" : "bg-[#ffffff] text-[#121212] hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main white container */}
        <div
          role="tabpanel"
          className="w-full bg-[#ffffff] border border-[#121212] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs"
        >
          <ActiveComponent />
        </div>
      </div>
    </>
  );
}