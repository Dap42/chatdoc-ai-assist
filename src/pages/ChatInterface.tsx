import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Brain,
  Clock,
  Activity,
  MessageCircle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../components/DoctorLayout";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "doctor" | "patient" | "ai";
  timestamp: Date;
}

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  symptoms: string[];
  status: "active" | "waiting" | "completed";
}

const ChatInterface = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecentChatsCollapsed, setIsRecentChatsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleRecentChats = () => {
    setIsRecentChatsCollapsed((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
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

  // Mock patient data
  const patientInfo: PatientInfo = {
    id: patientId || "1",
    name: "Patient A",
    age: 32,
    gender: "Female",
    symptoms: ["Headache", "Fever", "Fatigue"],
    status: "active",
  };

  // Mock initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "1",
        content:
          "Hello Doctor, I have been experiencing severe headaches for the past 3 days.",
        sender: "patient",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        content:
          "I understand you're experiencing headaches. Can you describe the pain? Is it throbbing, sharp, or dull?",
        sender: "patient",
        timestamp: new Date(Date.now() - 3300000),
      },
      {
        id: "3",
        content:
          "Based on the symptoms mentioned, consider asking about: duration of symptoms, associated nausea, light sensitivity, and any recent stress factors.",
        sender: "ai",
        timestamp: new Date(Date.now() - 3000000),
      },
    ];
    setMessages(initialMessages);

    // Mock AI suggestions
    setAiSuggestions([
      "Ask about frequency and timing of headaches",
      "Inquire about any triggers or recent changes",
      "Check for associated symptoms like nausea or vision changes",
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "doctor",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Simulate AI response after doctor's message
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Medical terminology note: ${
          message.includes("headache")
            ? "Cephalgia refers to head pain. Consider tension headaches, migraines, or cluster headaches."
            : "Consider documenting symptoms systematically for accurate assessment."
        }`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Recent Chats Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isRecentChatsCollapsed ? "w-0 overflow-hidden" : "w-80"
        } space-y-4 relative flex-shrink-0 h-full`}
      >
        {/* Collapse/Expand Button */}
        <Button
          onClick={toggleRecentChats}
          variant="outline"
          size="sm"
          className="absolute -right-3 top-4 z-10 h-6 w-6 p-0 bg-white border shadow-md hover:shadow-lg"
        >
          {isRecentChatsCollapsed ? (
            <ChevronsRight className="h-3 w-3" />
          ) : (
            <ChevronsLeft className="h-3 w-3" />
          )}
        </Button>
        {!isRecentChatsCollapsed && (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{chat.patientName}</p>
                      <p className="text-sm text-gray-600">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-full">
        <CardHeader className="py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/doctor-dashboard")}
              >
                <ChevronsLeft className="h-4 w-4 mr-1" /> Back to Dashboard
              </Button>
              <CardTitle className="text-lg">
                Chat with {patientInfo.name}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setMessages([])}
              >
                Clear Chat
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto flex flex-col p-4 items-center justify-center">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <MessageCircle className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg font-medium">
                Start Your Medical Consultation
              </p>
              <p className="text-sm mt-1">
                Ask questions about patient cases, symptoms, treatment
                protocols, or medical procedures.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
                Example: "I have a patient with acute chest pain and elevated
                troponin levels. What's the recommended treatment protocol?"
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4 w-full">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`
                    flex ${
                      msg.sender === "doctor" ? "justify-end" : "justify-start"
                    }
                    ${msg.sender === "ai" ? "px-6" : ""}
                  `}
                >
                  <div
                    className={`
                      max-w-[70%] rounded-lg p-3
                      ${msg.sender === "doctor" ? "bg-blue-600 text-white" : ""}
                      ${
                        msg.sender === "patient"
                          ? "bg-gray-200 text-gray-800"
                          : ""
                      }
                      ${
                        msg.sender === "ai"
                          ? "bg-blue-50 text-blue-800 border border-blue-200 w-full"
                          : ""
                      }
                    `}
                  >
                    {msg.sender === "ai" && (
                      <div className="flex items-center gap-1 mb-1 text-xs font-medium text-blue-700">
                        <Bot className="h-3 w-3" />
                        AI Assistant
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Describe your patient case or ask a medical question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
