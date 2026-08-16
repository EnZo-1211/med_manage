"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const avatar = localStorage.getItem("user_avatar");
    if (name) setUserName(name);
    if (avatar) setUserAvatar(avatar);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "home" },
    { name: "Reminders", href: "#", icon: "bell", badge: "Soon" },
    { name: "Settings", href: "#", icon: "settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-800 font-sans overflow-hidden">
      {/* Sidebar - Dynamically rendered based on state */}
      {isSidebarOpen && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-300 fixed md:relative z-20 h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5a.75.75 0 00-1.5 0v1.5h-1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">MediCare</span>
            </div>
            {/* Close button inside sidebar for both mobile and desktop */}
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              let isActive = false;
              if (item.name === "Dashboard" && (pathname === "/dashboard" || pathname === "/dashboard/")) isActive = true;
              else if (item.name !== "Dashboard" && pathname.startsWith(item.href) && item.href !== "#") isActive = true;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#FF6600] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      <div className="w-3 h-3 rounded-full border-2 border-current"></div>
                    </div>
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }} 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#FF6600] hover:bg-orange-50 rounded-xl transition-colors w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-gray-900/50 z-10" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 gap-4">
          <div className="flex-1 flex items-center">
            {/* Hamburger Button (Always visible on mobile, toggles sidebar on desktop) */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 shrink-0" title="Toggle Navigation">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {pathname !== "/dashboard" && pathname !== "/dashboard/" && (
              <Link href="/dashboard" className="hidden sm:flex ml-6 items-center text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Go back to dashboard
              </Link>
            )}
          </div>
            
          {/* Horizontal Navigation (Hidden on mobile, visible on desktop when sidebar is closed) */}
          <div className="flex-none flex justify-center overflow-hidden">
            {!isSidebarOpen && (
              <nav className="hidden md:flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {navItems.map((item) => {
                  let isActive = false;
                  if (item.name === "Dashboard" && (pathname === "/dashboard" || pathname === "/dashboard/")) isActive = true;
                  else if (item.name !== "Dashboard" && pathname.startsWith(item.href) && item.href !== "#") isActive = true;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-[#FF6600] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className={`w-4 h-4 flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-current"></div>
                      </div>
                      {item.name}
                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-4 shrink-0">
            <button className="text-gray-400 hover:text-gray-600 relative hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>
            <div className="relative border-l border-gray-200 pl-4">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Account Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";
                      }} 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
