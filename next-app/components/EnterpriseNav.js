"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  ClipboardList,
  Receipt,
  CheckCircle,
  BarChart,
  Users,
  Building2,
  Settings,
  HelpCircle,
  User,
  Briefcase,
  PieChart,
  LogOut,
} from "lucide-react";

export default function EnterpriseNav({ onShowHelp }) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState("Alex Smith");
  const [userInitials, setUserInitials] = useState("AS");

  useEffect(() => {
    // Get user from localStorage
    const email = localStorage.getItem("userEmail") || "Alex Smith";
    setUserName(email);
    setUserInitials(email.split("@")[0].substring(0, 2).toUpperCase());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  const handleClickOutside = (e) => {
    if (showProfile && !e.target.closest(".profile-dropdown")) {
      setShowProfile(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  const navItems = [
    { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "/projects", label: "Projects", icon: Folder },
    { id: "/tasks", label: "Tasks", icon: CheckSquare },
    { id: "/timesheet", label: "Timesheet", icon: ClipboardList },
    { id: "/clients", label: "Clients", icon: Building2 },
    { id: "/stakeholders", label: "Stakeholders", icon: Users },
    { id: "/expenses", label: "Expenses", icon: Receipt },
    { id: "/approvals", label: "Approvals", icon: CheckCircle },
    { id: "/reports", label: "Reports", icon: BarChart },
    { id: "/staff", label: "Staff", icon: Briefcase },
    { id: "/settings", label: "Settings", icon: Settings },
    { id: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0F172A] text-white z-40">
        <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">IP</span>
            </div>
            <span className="text-xl font-bold tracking-tight">I-PROJECT</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.id || pathname?.startsWith(item.id + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.id}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="mr-3"
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          {onShowHelp && (
            <button
              onClick={onShowHelp}
              className="w-full flex items-center px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
            >
              <HelpCircle size={20} className="mr-3" />
              <span className="font-medium text-sm">ช่วยเหลือ</span>
            </button>
          )}
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {userName.split("@")[0]}
              </div>
              <div className="text-xs text-slate-400">Team Member</div>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 z-30 px-6 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <div className="icon-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects or tasks..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 hover:bg-slate-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {userInitials}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-semibold">
                  {userName.split("@")[0]}
                </div>
                <div className="text-xs text-slate-600">Team Member</div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${showProfile ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="font-semibold text-sm">
                    {userName.split("@")[0]}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{userName}</div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <User size={18} className="mr-3 text-slate-600" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <Settings size={18} className="mr-3 text-slate-600" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-slate-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userName}
                      disabled
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-slate-600">
                        Receive updates via email
                      </div>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-full h-full bg-slate-200 peer-checked:bg-blue-600 rounded-full peer transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-slate-600">
                        Use dark theme
                      </div>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-full h-full bg-slate-200 peer-checked:bg-blue-600 rounded-full peer transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
