export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white mt-20">
      <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LEFT */}
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold tracking-wide">
            Talha&apos;s Diary
          </p>
          <p className="text-xs text-cyan-200 mt-1">
            Designed by Aurora ✨
          </p>
        </div>

        {/* CENTER */}
        <div className="text-center">
          <p className="text-xs text-cyan-200">
            A personal task & project tracker built for focus, clarity, and
            execution.
          </p>
        </div>

        {/* RIGHT */}
        <div className="text-center md:text-right">
          <p className="text-xs text-cyan-200">
            © {new Date().getFullYear()} Talha Arif. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}