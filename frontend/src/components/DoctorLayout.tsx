import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  LayoutDashboard,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "./ui/theme-toggle";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for sidebar collapse
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "Doctor",
    profileImage: undefined as string | undefined,
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("doctorProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileData({
        fullName: parsedProfile.fullName || user?.name || "Doctor",
        profileImage: parsedProfile.profileImage || undefined,
      });
    }
  }, [user?.name]);

  // Listen for changes in localStorage to update profile data dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem("doctorProfile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData({
          fullName: parsedProfile.fullName || user?.name || "Doctor",
          profileImage: parsedProfile.profileImage || undefined,
        });
      } else {
        setProfileData({
          fullName: user?.name || "Doctor",
          profileImage: undefined,
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageCircle },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col fixed inset-y-0 left-0 z-30 bg-white shadow-lg border-r border-gray-200 transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isSidebarCollapsed ? "w-20" : "w-80"}
          lg:static lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          {!isSidebarCollapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-11 w-15" />
              <span className="text-xl font-bold text-gray-900">
                Doctor AI Chat
              </span>
            </Link>
          )}

          {isSidebarCollapsed && (
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-11 w-15 mx-auto" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`flex-shrink-0 hover:bg-gray-100 mt-2`}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 mt-8 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center py-3 text-sm font-medium rounded-lg transition-colors
                      ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isSidebarCollapsed ? "" : "mr-3"}`}
                    />
                    {!isSidebarCollapsed && item.name}
                  </Link>
                </li>
              );
            })}
            <li
              className={`${
                isSidebarCollapsed ? "flex justify-center" : "px-4"
              } py-3`}
            >
              <ModeToggle />
            </li>
          </ul>
        </nav>

        {/* User info and Sign Out at the bottom */}
        <div className="mt-auto p-6 border-t">
          <Link
            to="/doctor-profile"
            className={`flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors w-full mb-2 ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={profileData.profileImage}
                alt={profileData.fullName}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                {profileData.fullName
                  .split(" ")
                  .filter(
                    (word, index) =>
                      !(
                        index === 0 &&
                        (word.toLowerCase() === "doctor" ||
                          word.toLowerCase() === "dr.")
                      )
                  )
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profileData.fullName}
                </p>
              </div>
            )}
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full border-red-300 text-red-600 hover:bg-red-50 ${
              isSidebarCollapsed ? "hidden" : ""
            }`}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b lg:hidden flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Doctor Dashboard
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
