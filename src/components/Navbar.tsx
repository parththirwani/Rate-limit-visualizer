export default function Navbar() {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Rate Limit Visualizer
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Understand how production systems control traffic.
          </p>
        </div>
      </div>
    </nav>
  );
}