import Sidebar from '../../components/Sidebar';
import { UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: any) {
  const usage = {
    captions: 3,
    captionLimit: 5,
    videos: 0,
    videoLimit: 1
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar userTier="FREE" usage={usage} />

      <div className="flex-1 ml-60">
        <header className="h-16 bg-slate-950/85 border-b border-white/[0.07] backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
          <div className="flex-1 font-bold text-xl text-slate-100">Dashboard</div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-bold tracking-wide border border-white/[0.07]">
              FREE PLAN
            </span>
            <UserButton />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
