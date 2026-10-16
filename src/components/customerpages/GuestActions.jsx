export default function GuestActions({ onFindBooking, onLogin }) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onFindBooking}
        className="bg-[#121212] border border-[#ccff00] text-[#ccff00] hover:bg-black font-bold text-sm px-4 py-2 rounded-xl cursor-pointer transition-colors"
      >
        Find your booking
      </button>
      <button
        type="button"
        onClick={onLogin}
        className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-bold text-sm px-6 py-2 rounded-xl cursor-pointer transition-colors"
      >
        Login
      </button>
    </div>
  )
}