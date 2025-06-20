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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );

  // Load profile image from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("doctorProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileImage(parsedProfile.profileImage || undefined);
    }
  }, []); // No dependency on user?.name here, as name comes from AuthContext

  // Listen for changes in localStorage to update profile image dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem("doctorProfile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileImage(parsedProfile.profileImage || undefined);
      } else {
        setProfileImage(undefined);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // No dependency on user?.name here

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-80 flex flex-col fixed inset-y-0 left-0 z-30 bg-white shadow-lg lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Doctor AI</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 mt-8">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info and Sign Out at the bottom */}
        <div className="mt-auto p-4 border-t">
          <Link
            to="/doctor-profile"
            className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors w-full mb-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profileImage} alt={user?.name || "Doctor"} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "DR"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Doctor"}
              </p>
            </div>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 lg:ml-80`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
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
            <div></div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
