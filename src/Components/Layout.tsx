// src/Components/Layout.tsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import ComposeModal from "./Widgets/ComposeModal";
import { useFeedRefresh } from "../contexts/FeedRefreshContext";

const Layout: React.FC = () => {
  const [showCompose, setShowCompose] = useState<{
    mode: "post" | "quote" | "reply";
    parentId?: number;
  } | null>(null);
  const { triggerRefresh } = useFeedRefresh();
  const openCompose = () => setShowCompose({ mode: "post" });
  const closeCompose = () => setShowCompose(null);

  return (
    <div className="grid grid-cols-5 min-h-screen bg-black text-white">
      {/* Coloana Sidebar (statică) */}
      <aside className="hidden sm:block sm:col-span-1 p-2 bg-black border-r border-gray-700 sticky top-0 h-screen">
        <Sidebar onComposeClick={openCompose} />
      </aside>

      {/* Main (se schimbă cu ceru Outlet) */}
      {/* Coloana mijloc */}
      <main className="col-span-5 sm:col-span-3 flex justify-center overflow-y-auto">
        <div className="w-full max-w-xl border-x border-gray-700">
          <p>Main</p>
          <Outlet></Outlet>
        </div>
      </main>

      {/* Coloana dreapta opțională */}
      <aside className="hidden xl:block xl:col-span-1 p-4 bg-black border-l border-gray-700">
        <p>SideBAr2</p>
        {/* poți pune ceva aici sau lăsa gol */}
      </aside>

      {/* 3) Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={closeCompose}
          onSuccess={() => {
            triggerRefresh();
            setShowCompose(null);
          }}
        />
      )}
    </div>
  );
};

export default Layout;
