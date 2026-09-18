import { SITE_CONFIG } from "@/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
      <div className="max-w-4xl mx-auto px-4">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        <p className="mt-1 text-zinc-400 dark:text-zinc-600">{SITE_CONFIG.description}</p>
      </div>
    </footer>
  );
}
