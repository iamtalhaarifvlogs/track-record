"use client";

import Link from "next/link";

export default function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white shadow-xl sticky top-0 z-50">
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
          <button
            onClick={() => scrollToSection("top")}
            className="hover:text-cyan-200 transition duration-200"
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection("tasks")}
            className="hover:text-cyan-200 transition duration-200"
          >
            Tasks
          </button>

          <button
            onClick={() => scrollToSection("projects")}
            className="hover:text-cyan-200 transition duration-200"
          >
            Projects
          </button>

          <button
            onClick={() => scrollToSection("clients")}
            className="hover:text-cyan-200 transition duration-200"
          >
            Clients
          </button>

          <button
            onClick={() => scrollToSection("notes")}
            className="hover:text-cyan-200 transition duration-200"
          >
            Notes
          </button>
        </nav>
      </div>
    </header>
  );
}