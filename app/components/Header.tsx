import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white shadow-xl">
      <div className="container mx-auto px-6 py-5 max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* LOGO + TITLE */}
        <div className="flex items-center gap-4">
          {/* LOGO */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <span className="text-cyan-900 font-extrabold text-xl">T</span>
          </div>

          {/* TITLE */}
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Talha&apos;s Diary
            </h1>
            <p className="text-sm text-cyan-200 font-medium">
              Designed by Aurora ✨
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-wrap gap-3 md:gap-6 text-sm md:text-base font-semibold">
          <Link
            href="/"
            className="hover:text-cyan-200 transition duration-200"
          >
            Home
          </Link>

          <Link
            href="/tasks"
            className="hover:text-cyan-200 transition duration-200"
          >
            Tasks
          </Link>

          <Link
            href="/projects"
            className="hover:text-cyan-200 transition duration-200"
          >
            Projects
          </Link>

          <Link
            href="/clients"
            className="hover:text-cyan-200 transition duration-200"
          >
            Clients
          </Link>

          <Link
            href="/reports"
            className="hover:text-cyan-200 transition duration-200"
          >
            Reports
          </Link>
        </nav>
      </div>
    </header>
  );
}
