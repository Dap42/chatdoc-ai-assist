
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";

interface Message {
  id: string;
  content: string;
  sender: "doctor" | "patient" | "ai";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  patientName: string;
  lastMessage: string;
  time: string;
  status: "active" | "completed" | "pending";
}

const ChatInterface = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState(
    "Medical Consultation"
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Effect to load recent chats from localStorage and keep them updated
  useEffect(() => {
    const loadRecentChats = () => {
      const storedRecentChats = localStorage.getItem("recentChats");
      if (storedRecentChats) {
        setRecentChats(JSON.parse(storedRecentChats));
      } else {
        setRecentChats([]);
      }
    };

    loadRecentChats();
    window.addEventListener("storage", loadRecentChats);

    return () => {
      window.removeEventListener("storage", loadRecentChats);
    };
  }, []);

  // Effect to load messages for the current chatId and set chat title
  useEffect(() => {
    if (chatId) {
      const storedMessages = localStorage.getItem(`chat-${chatId}-messages`);
      if (storedMessages) {
        setMessages(
          JSON.parse(storedMessages).map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } else {
        const initialMessage: Message = {
          id: `initial-msg-${chatId}`,
          content: `Welcome to this consultation. This is the start of your chat session.`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
        localStorage.setItem(
          `chat-${chatId}-messages`,
          JSON.stringify([initialMessage])
        );
      }

      const currentChat = recentChats.find((chat) => chat.id === chatId);
      if (currentChat) {
        setCurrentChatTitle(currentChat.patientName);
      } else {
        setCurrentChatTitle(
          `Chat with ${chatId.substring(chatId.indexOf("-") + 1)}`
        );
      }
    } else {
      const newChatId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: newChatId,
        patientName: `New Patient ${recentChats.length + 1}`,
        lastMessage: "No messages yet",
        time: "Just now",
        status: "active",
      };
      const updatedChats = [newChat, ...recentChats];
      localStorage.setItem("recentChats", JSON.stringify(updatedChats));
      navigate(`/chat/${newChatId}`, { replace: true });
    }
  }, [chatId, recentChats]);

  // Effect to save messages to localStorage whenever they change for the current chatId
  useEffect(() => {
    if (chatId && messages.length > 0) {
      localStorage.setItem(`chat-${chatId}-messages`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "doctor",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");

    setRecentChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: newMessage.content, time: "Just now" }
          : chat
      );
      localStorage.setItem("recentChats", JSON.stringify(updatedChats));
      return updatedChats;
    });

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Medical terminology note: ${
          newMessage.content.includes("headache")
            ? "Cephalgia refers to head pain. Consider tension headaches, migraines, or cluster headaches."
            : "Consider documenting symptoms systematically for accurate assessment."
        }`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const handleChatSelect = (selectedChatId: string) => {
    navigate(`/chat/${selectedChatId}`);
  };

  const handleDeleteSelectedChats = () => {
    if (selectedChats.length === 0) return;

    const updatedChats = recentChats.filter(
      (chat) => !selectedChats.includes(chat.id)
    );
    setRecentChats(updatedChats);
    localStorage.setItem("recentChats", JSON.stringify(updatedChats));

    selectedChats.forEach((chatIdToDelete) => {
      localStorage.removeItem(`chat-${chatIdToDelete}-messages`);
    });

    setSelectedChats([]);

    if (chatId && selectedChats.includes(chatId)) {
      if (updatedChats.length > 0) {
        navigate(`/chat/${updatedChats[0].id}`);
      } else {
        navigate("/doctor-dashboard");
      }
    }
  };

  const handleClearChat = () => {
    if (chatId) {
      setMessages([]);
      localStorage.removeItem(`chat-${chatId}-messages`);
      setRecentChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: "Chat cleared",
                status: "completed" as "completed",
              }
            : chat
        );
        localStorage.setItem("recentChats", JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ChatSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        recentChats={recentChats}
        selectedChats={selectedChats}
        setSelectedChats={setSelectedChats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentChatId={chatId}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onDeleteSelectedChats={handleDeleteSelectedChats}
      />

      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="py-4 px-6 border-b bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/doctor-dashboard")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentChatTitle}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearChat}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 bg-gray-50 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4">
              <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            </div>
            
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
