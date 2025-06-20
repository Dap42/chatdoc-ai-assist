import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  User,
  Activity,
  Clock,
  Users,
  Brain,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import DoctorLayout from "../components/DoctorLayout";
import { useState, useEffect } from "react";

interface ChatSession {
  id: string;
  patientName: string;
  lastMessage: string;
  time: string;
  status: "active" | "completed" | "pending";
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]); // New state for selected chats

  // Effect to load recent chats from localStorage and keep them updated
  useEffect(() => {
    const loadRecentChats = () => {
      const storedChats = localStorage.getItem("recentChats");
      if (storedChats) {
        setRecentChats(JSON.parse(storedChats));
      } else {
        setRecentChats([]); // Initialize as empty if nothing in storage
      }
    };

    loadRecentChats(); // Load on initial mount

    // Listen for storage events to update recent chats across tabs/windows
    window.addEventListener("storage", loadRecentChats);

    return () => {
      window.removeEventListener("storage", loadRecentChats);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      patientName: `New Patient ${recentChats.length + 1}`,
      lastMessage: "No messages yet",
      time: "Just now",
      status: "active",
    };

    const updatedChats = [newChat, ...recentChats];
    setRecentChats(updatedChats);
    localStorage.setItem("recentChats", JSON.stringify(updatedChats));
    navigate(`/chat/${newChatId}`);
  };

  const handleSelectAllChats = (isChecked: boolean) => {
    if (isChecked) {
      const allChatIds = recentChats.map((chat) => chat.id);
      setSelectedChats(allChatIds);
    } else {
      setSelectedChats([]);
    }
  };

  const handleSelectChat = (chatId: string, isChecked: boolean) => {
    setSelectedChats((prevSelected) =>
      isChecked
        ? [...prevSelected, chatId]
        : prevSelected.filter((id) => id !== chatId)
    );
  };

  const handleDeleteSelectedChats = () => {
    if (selectedChats.length === 0) return;

    // Remove selected chats from recentChats
    const updatedChats = recentChats.filter(
      (chat) => !selectedChats.includes(chat.id)
    );
    setRecentChats(updatedChats);
    localStorage.setItem("recentChats", JSON.stringify(updatedChats));

    // Remove associated messages from localStorage for each selected chat
    selectedChats.forEach((chatId) => {
      localStorage.removeItem(`chat-${chatId}-messages`);
    });

    // Clear selection
    setSelectedChats([]);

    // If any deleted chat was the currently viewed one, navigate to dashboard
    const currentPathChatId = window.location.pathname.split("/").pop();
    if (currentPathChatId && selectedChats.includes(currentPathChatId)) {
      navigate("/doctor-dashboard");
    }
  };

  // Mock data - replace with real API calls
  const stats = {
    totalChats: 24,
    activeChats: 3,
    todayChats: 8,
    aiAssists: 45,
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-blue-100">
            Here's your medical consultation overview for today
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              onClick={handleNewChat}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() =>
                recentChats.length > 0 && navigate(`/chat/${recentChats[0].id}`)
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat History
            </Button>
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-2xl font-bold">Recent Chats</CardTitle>
              {recentChats.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-chats"
                    checked={
                      selectedChats.length === recentChats.length &&
                      recentChats.length > 0
                    }
                    onCheckedChange={(isChecked: boolean) =>
                      handleSelectAllChats(isChecked)
                    }
                  />
                  <label
                    htmlFor="select-all-chats"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>
              )}
            </div>
            {selectedChats.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelectedChats}
                className="ml-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedChats.length})
              </Button>
            )}
          </CardHeader>
          <CardDescription className="px-6 pb-4">
            Your most recent patient consultations
          </CardDescription>
          <CardContent>
            {recentChats.length === 0 ? (
              <p className="text-gray-500">No recent chats. Start a new one!</p>
            ) : (
              <div className="space-y-4">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center p-3 border rounded-md hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`checkbox-${chat.id}`}
                      checked={selectedChats.includes(chat.id)}
                      onCheckedChange={(isChecked: boolean) =>
                        handleSelectChat(chat.id, isChecked)
                      }
                      className="mr-4"
                    />
                    <Link
                      to={`/chat/${chat.id}`}
                      className="flex-1 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{chat.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {chat.lastMessage}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            chat.status === "active"
                              ? "default"
                              : chat.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {chat.status}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {chat.time}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Disclaimer */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  AI Assistant Reminder
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The AI assistant provides preliminary insights and terminology
                  support only. All final medical decisions and diagnoses must
                  be made by you as the healthcare professional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
