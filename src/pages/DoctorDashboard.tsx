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

import { formatTimestamp } from "@/lib/utils";

interface ChatSession {
  id: string;
  patientName: string;
  lastMessage: string;
  time: Date;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);

  // Effect to load recent chats from localStorage and keep them updated
  useEffect(() => {
    const loadRecentChats = () => {
      const storedChats = localStorage.getItem("recentChats");
      if (storedChats) {
        const parsedChats: ChatSession[] = JSON.parse(storedChats).map(
          (chat: any) => {
            const chatTime =
              typeof chat.time === "string" &&
              !isNaN(new Date(chat.time).getTime())
                ? new Date(chat.time)
                : new Date(); // Fallback to current date if invalid or not a string
            return { ...chat, time: chatTime };
          }
        );
        setRecentChats(parsedChats);
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
      time: new Date(),
    };

    const updatedChats = [newChat, ...recentChats];
    setRecentChats(updatedChats);
    localStorage.setItem(
      "recentChats",
      JSON.stringify(
        updatedChats.map((chat) => ({ ...chat, time: chat.time.toISOString() }))
      )
    );
    navigate(`/chat/${newChatId}`);
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
            <CardTitle className="text-2xl font-bold">Recent Chats</CardTitle>
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
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="flex items-center p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{chat.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <span className="text-sm text-gray-400">
                        {formatTimestamp(chat.time)}
                      </span>
                    </div>
                  </Link>
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
