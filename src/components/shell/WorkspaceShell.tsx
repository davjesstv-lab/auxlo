import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { getCurrentRole } from "@/lib/data/org";

/**
 * The workspace shell: a left navigation rail, a top bar carrying the
 * engagement status indicator and language switcher, the main content area,
 * and a footer reinforcing the Canadian-operated, residency-scoped framing.
 */
export async function WorkspaceShell({
  children,
  demoMode = false,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
}) {
  const isAdmin = (await getCurrentRole()) === "admin";
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar demoMode={demoMode} />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
