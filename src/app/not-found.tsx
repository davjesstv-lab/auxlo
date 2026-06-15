import "./globals.css";

// Global not-found for paths without a valid locale prefix. It provides its
// own html/body because there is no root layout above the [locale] segment.
export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white text-ink">
        <div className="text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-muted">
            404
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            Page not found
          </h1>
          <a href="/en" className="mt-4 inline-block text-sm text-indigo">
            Return to MapleGuard
          </a>
        </div>
      </body>
    </html>
  );
}
