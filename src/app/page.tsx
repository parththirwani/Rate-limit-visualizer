import Navbar from "@/src/components/Navbar";
import VisualizerClient from "@/src/components/VisualizerClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-6 py-12">
        <VisualizerClient />
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
          Built to understand rate limiting algorithms in production systems.
        </div>
      </footer>
    </div>
  );
}