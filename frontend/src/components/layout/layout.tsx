import React, { useState } from "react";
import { Header } from "../header/Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* отступ под фикс. header */}
      {/* <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
      <div className="flex-1">
        {/* <Header /> */}
        <main className=" overflow-hidden transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
