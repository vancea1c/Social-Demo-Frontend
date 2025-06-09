// src/Components/Layout.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import ComposeModal from "./Widgets/ComposeModal";
import { useFeedRefresh } from "../contexts/FeedRefreshContext";
import { useCurrentTitle } from "../contexts/PageTitleContext";
import { FaArrowLeft } from "react-icons/fa6";
import Widgets from "./Widgets/Widgets";

const Layout: React.FC = () => {
  const [showCompose, setShowCompose] = useState<{
    mode: "post" | "quote" | "reply";
    parentId?: number;
  } | null>(null);
  const { triggerRefresh } = useFeedRefresh();
  const title = useCurrentTitle();
  const navigate = useNavigate();
  const isOnHome = Boolean(useMatch({ path: "/home", end: true }));

  const openCompose = () => setShowCompose({ mode: "post" });
  const closeCompose = () => setShowCompose(null);

  // Optional: lock body scroll when modal is open
  useEffect(() => {
    if (showCompose) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCompose]);

  return (
    <div className="grid grid-cols-5 min-h-screen bg-black text-white">
      {/* Coloana Sidebar (statică) */}
      <aside className="sm:block sm:col-span-1 p-2 bg-black border-r border-gray-700 sticky top-0 h-screen">
        <Sidebar onComposeClick={openCompose} />
      </aside>

      {/* Main (se schimbă cu ceru Outlet) */}
      {/* Coloana mijloc */}
      <main className="col-span-5 sm:col-span-3 flex-column justify-center overflow-y-auto h-screen pb-48">
        {/* ===== HEADER BAR ===== */}
        <div
          className="sticky top-0 z-10 w-full
                        max-w-xl flex items-center 
                        px-4 py-2 bg-transparent
                        backdrop-blur-sm
                        border-0 border-gray-700/50
                        "
        >
          {/*
            If a page has set a `title`, show a back arrow + H1.
            Otherwise, leave this empty (for example, on the “feed” page).
          */}
          {title ? (
            <>
              {!isOnHome && (
                <button
                  className="bg-transparent"
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                >
                  <span className="bg-transparent">
                    <FaArrowLeft />
                  </span>
                </button>
              )}

              <h1 className="text-2xl font-bold">{title}</h1>
            </>
          ) : (
            // If no title, you could render nothing (or put a placeholder/logo)
            <div className="h-8" />
          )}
        </div>
        <div className="w-full max-w-xl">
          <Outlet></Outlet>
        </div>
      </main>

      {/* Coloana dreapta opțională */}
      <aside className=" xl:block xl:col-span-1 p-4 bg-black border-l border-gray-700">
        <p>SideBAr2</p>
        <Widgets></Widgets>
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
