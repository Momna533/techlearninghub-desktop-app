function StartupLoader() {
  return (
    <main className="min-h-screen bg-[#071b36] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-[#ffc400] animate-spin" />

        <h1 className="mt-6 text-2xl font-semibold tracking-wide text-white">
          Tech Learning Hub
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Loading...
        </p>
      </div>
    </main>
  );
}

export default StartupLoader;