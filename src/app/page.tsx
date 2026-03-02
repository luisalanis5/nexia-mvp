import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00FFCC] to-white">
        NEXIA
      </h1>
      <p className="text-xl text-gray-400 mb-10 max-w-md">
        La plataforma de enlaces para la nueva generación de creadores y desarrolladores.
      </p>

      <div className="flex gap-4">
        <Link
          href="/dashboard/login"
          className="px-8 py-4 bg-[#00FFCC] text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,204,0.4)]"
        >
          Empezar Gratis
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-gray-900 border border-gray-800 font-bold rounded-2xl hover:bg-gray-800 transition-colors"
        >
          Mi Dashboard
        </Link>
      </div>

      <footer className="absolute bottom-8 text-gray-600 text-xs uppercase tracking-widest font-bold">
        State of the art · 2026
      </footer>
    </div>
  );
}
