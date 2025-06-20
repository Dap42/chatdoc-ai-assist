import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
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
  LogOut,
  Search,
  Trash2,
  Mic, // Import Mic icon
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
  const [selectedChats, setSelectedChats] = useState<string[]>([]); // New state for selected chats
  const [currentChatTitle, setCurrentChatTitle] = useState(
    "Medical Consultation"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  // Effect to load recent chats from localStorage and keep them updated
  useEffect(() => {
    const loadRecentChats = () => {
      const storedRecentChats = localStorage.getItem("recentChats");
      if (storedRecentChats) {
        setRecentChats(JSON.parse(storedRecentChats));
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
        // If no messages for this chat, initialize with an AI welcome message
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

      // Set current chat title based on the chat ID from the recentChats state
      const currentChat = recentChats.find((chat) => chat.id === chatId);
      if (currentChat) {
        setCurrentChatTitle(currentChat.patientName);
      } else {
        // Fallback title if chat not found in recentChats (e.g., new chat not yet fully propagated)
        setCurrentChatTitle(
          `Chat with ${chatId.substring(chatId.indexOf("-") + 1)}`
        );
      }
    } else {
      // If no chatId in URL, navigate to a new chat
      const newChatId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: newChatId,
        patientName: `New Patient ${recentChats.length + 1}`,
        lastMessage: "No messages yet",
        time: "Just now",
        status: "active",
      };
      const updatedChats = [newChat, ...recentChats];
      localStorage.setItem("recentChats", JSON.stringify(updatedChats)); // Update localStorage immediately
      navigate(`/chat/${newChatId}`, { replace: true }); // Redirect to the new chat ID
    }
  }, [chatId, recentChats]); // Depend on chatId and recentChats to re-run when either changes

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

    // Update last message and time in recent chats
    setRecentChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: newMessage.content, time: "Just now" }
          : chat
      );
      localStorage.setItem("recentChats", JSON.stringify(updatedChats));
      return updatedChats;
    });

    // Simulate AI response after doctor's message
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

  const filteredChats = recentChats.filter(
    (chat) =>
      chat.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAllChats = (isChecked: boolean) => {
    if (isChecked) {
      const allChatIds = filteredChats.map((chat) => chat.id);
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
    selectedChats.forEach((chatIdToDelete) => {
      localStorage.removeItem(`chat-${chatIdToDelete}-messages`);
    });

    // Clear selection
    setSelectedChats([]);

    // If the currently viewed chat was deleted, navigate to a new chat or dashboard
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
      // Optionally update recent chat status or last message
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
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 flex flex-col bg-gray-900 shadow-lg p-4 space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={handleNewChat}
        >
          <MessageCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>

        <div className="relative mt-4 mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="flex-1 flex flex-col border-gray-700 shadow-md bg-gray-900">
          <CardHeader className="px-0 py-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase">
              Recent Consultations
            </CardTitle>
            {filteredChats.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-chats"
                  checked={
                    selectedChats.length === filteredChats.length &&
                    filteredChats.length > 0
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
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 px-0">
            {selectedChats.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelectedChats}
                className="w-full mb-4"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedChats.length})
              </Button>
            )}
            {filteredChats.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No recent chats. Start a new one!
              </p>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      chatId === chat.id
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-800 text-gray-300"
                    }`}
                >
                  <Checkbox
                    id={`checkbox-${chat.id}`}
                    checked={selectedChats.includes(chat.id)}
                    onCheckedChange={(isChecked: boolean) =>
                      handleSelectChat(chat.id, isChecked)
                    }
                    className="mr-3"
                  />
                  <div
                    className="flex-1 flex items-center space-x-3"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-sm">{chat.patientName}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-full bg-gray-900 rounded-none border-none shadow-none">
        <CardHeader className="py-3 border-b border-gray-200 bg-gray-900 rounded-none shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/doctor-dashboard")}
              >
                <ChevronsLeft className="h-4 w-4 text-gray-400" />
              </Button>
              <CardTitle className="text-lg text-white">
                {currentChatTitle}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="destructive" size="sm" onClick={handleClearChat}>
                Clear Chat
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 py-8 bg-gray-900">
          <div className="flex flex-col h-full overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 max-w-2xl mx-auto">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-semibold mb-2">
                  Start Your Medical Consultation
                </p>
                <p className="text-base mt-1">
                  Ask questions about patient cases, symptoms, treatment
                  protocols, or medical Protocols.
                </p>
                <div className="mt-6 p-4 bg-gray-700 rounded-md text-gray-300 text-sm border border-gray-600">
                  Example: "I have a patient with acute chest pain and elevated
                  troponin levels. What's the recommended treatment protocol?"
                </div>
              </div>
            ) : (
              <div className="space-y-6 w-full max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "doctor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[80%] ${
                        msg.sender === "doctor" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0
                          ${
                            msg.sender === "doctor"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                      >
                        {msg.sender === "doctor" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-xl p-3
                          ${
                            msg.sender === "doctor"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 border border-gray-600"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className="text-xs mt-2 text-gray-400 text-right">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </CardContent>
        {/* Message Input */}
        <div className="p-4 border-t-0 bg-gray-900 flex items-center justify-center shadow-none">
          <div className="w-full max-w-3xl bg-gray-800 rounded-full shadow-lg flex items-center">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-5 py-3 min-h-[56px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none text-base"
              rows={1}
              style={{ overflowY: "hidden" }}
            />
            <div className="flex items-center pr-2">
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
