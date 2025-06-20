import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import DoctorLayout from "../components/DoctorLayout";
import { useState } from "react";

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    totalChats: 24,
    activeChats: 3,
    todayChats: 8,
    aiAssists: 45,
  };

  const recentChats = [
    {
      id: 1,
      patientName: "Patient A",
      lastMessage: "Thank you for the consultation",
      time: "2 min ago",
      status: "active",
    },
    {
      id: 2,
      patientName: "Patient B",
      lastMessage: "I have been feeling better",
      time: "15 min ago",
      status: "completed",
    },
    {
      id: 3,
      patientName: "Patient C",
      lastMessage: "Could you please clarify...",
      time: "1 hour ago",
      status: "pending",
    },
  ];

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
            <Link to="/chat">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </Link>
            <Link to="/doctor-profile">
              <Button
                variant="outline"
                className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
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
