// Auth is already enforced by middleware.ts — no session check needed here.
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&_#vsp-banner]:!hidden flex min-h-screen bg-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
