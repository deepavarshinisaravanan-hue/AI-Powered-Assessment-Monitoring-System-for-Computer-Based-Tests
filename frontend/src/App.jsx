function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-slate-950/40">
        <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
          Assessment Monitoring System
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Frontend scaffold is ready for development.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Tailwind CSS and the initial React dependencies are installed and the app is running from a clean Vite setup.
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
            React + Vite
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
            Tailwind CSS v4
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
            Ready for backend integration
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
