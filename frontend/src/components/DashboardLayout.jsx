import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardLayout() {
  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-white font-sans">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <TopHeader />
        <main className="flex min-h-0 flex-1 flex-col  overflow-y-auto bg-white p-6 lg:px-12 lg:py-10">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
