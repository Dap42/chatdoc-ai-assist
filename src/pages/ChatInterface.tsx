import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import { useToast } from "@/components/ui/use-toast"; // Import useToast

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
  time: Date;
}

const ChatInterface = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const { toast } = useToast(); // Initialize toast
  const [currentChatTitle, setCurrentChatTitle] = useState(
    "Medical Consultation"
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // Load recent chats from localStorage on component mount and update old names
  useEffect(() => {
    const storedRecentChats = localStorage.getItem("recentChats");
    if (storedRecentChats) {
      let parsedChats: ChatSession[] = JSON.parse(storedRecentChats);

      // Convert time strings to Date objects for all chats
      const chatsWithDateObjects = parsedChats.map((chat) => {
        const chatTime =
          typeof chat.time === "string" && !isNaN(new Date(chat.time).getTime())
            ? new Date(chat.time)
            : new Date(); // Fallback to current date if invalid or not a string
        return { ...chat, time: chatTime };
      });

      // Update existing "New Patient" names to "New Consultation"
      const updatedChats = chatsWithDateObjects.map((chat) => {
        if (chat.patientName.startsWith("New Patient")) {
          const patientNumber = chat.patientName.split(" ")[2];
          return {
            ...chat,
            patientName: `New Consultation ${patientNumber}`,
          };
        }
        return chat;
      });
      setRecentChats(updatedChats);
      localStorage.setItem(
        "recentChats",
        JSON.stringify(
          updatedChats.map((chat) => ({
            ...chat,
            time: chat.time.toISOString(),
          }))
        )
      ); // Persist the updated names
    }
  }, []);

  // Effect to handle storage changes for recent chats
  useEffect(() => {
    const handleStorageChange = () => {
      const storedRecentChats = localStorage.getItem("recentChats");
      if (storedRecentChats) {
        setRecentChats(JSON.parse(storedRecentChats));
      } else {
        setRecentChats([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Load messages for current chatId and manage new chat creation
  useEffect(() => {
    if (chatId) {
      const storedMessages = localStorage.getItem(`chat-${chatId}-messages`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } else {
        setMessages([]);
      }

      // Update chat title based on current chat
      const currentChat = recentChats.find((chat) => chat.id === chatId);
      if (currentChat) {
        setCurrentChatTitle(currentChat.patientName);
      } else {
        // Fallback title if chat not found in recentChats (e.g., direct link)
        setCurrentChatTitle(
          `Chat with ${chatId.substring(chatId.indexOf("-") + 1)}`
        );
      }
    } else if (recentChats.length > 0) {
      // If no chatId in URL but recent chats exist, navigate to the first one
      navigate(`/chat/${recentChats[0].id}`, { replace: true });
    } else {
      // If no chatId and no recent chats, create a new one
      const newChatId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: newChatId,
        patientName: `New Consultation ${recentChats.length + 1}`,
        lastMessage: "No messages yet",
        time: new Date(),
      };
      const updatedChats = [newChat, ...recentChats];
      localStorage.setItem(
        "recentChats",
        JSON.stringify(
          updatedChats.map((chat) => ({
            ...chat,
            time: chat.time.toISOString(),
          }))
        )
      );
      setRecentChats(updatedChats); // Update state immediately
      navigate(`/chat/${newChatId}`, { replace: true });
    }
  }, [chatId, navigate, recentChats]); // Added recentChats to dependency array for title update logic

  // Save messages to localStorage when they change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      console.log("Saving messages for chat:", chatId, messages);
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
      id: `msg-${Date.now()}`,
      content: message.trim(),
      sender: "doctor",
      timestamp: new Date(),
    };

    console.log("Sending new message:", newMessage);

    // Add the message to the current messages
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Updated messages (doctor):", updatedMessages);
      // Immediately save the updated messages to localStorage
      if (chatId) {
        localStorage.setItem(
          `chat-${chatId}-messages`,
          JSON.stringify(updatedMessages)
        );
      }
      return updatedMessages;
    });

    // Clear the input
    setMessage("");

    // Update recent chats
    setRecentChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: newMessage.content,
              time: new Date(),
            }
          : chat
      );
      localStorage.setItem(
        "recentChats",
        JSON.stringify(
          updatedChats.map((chat) => ({
            ...chat,
            time: chat.time.toISOString(),
          }))
        )
      );
      return updatedChats;
    });

    // Make API call to backend
    setIsLoading(true); // Set loading to true
    fetch("http://localhost:8000/api/search", { // Use the correct backend URL and port
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: newMessage.content }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: data.answer || "No answer found.",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, aiResponse];
          if (chatId) {
            localStorage.setItem(
              `chat-${chatId}-messages`,
              JSON.stringify(updatedMessages)
            );
          }
          return updatedMessages;
        });
      })
      .catch((error) => {
        console.error("Error fetching AI response:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
        const errorResponse: Message = {
          id: `ai-error-${Date.now()}`,
          content: "I'm sorry, I couldn't get a response. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorResponse]);
      })
      .finally(() => {
        setIsLoading(false); // Set loading to false regardless of success or failure
      });
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
      patientName: `New Consultation ${recentChats.length + 1}`,
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

  const handleChatSelect = (selectedChatId: string) => {
    navigate(`/chat/${selectedChatId}`);
  };

  const handleDeleteSelectedChats = () => {
    if (selectedChats.length === 0) return;

    const updatedChats = recentChats.filter(
      (chat) => !selectedChats.includes(chat.id)
    );
    setRecentChats(updatedChats);
    localStorage.setItem(
      "recentChats",
      JSON.stringify(
        updatedChats.map((chat) => ({ ...chat, time: chat.time.toISOString() }))
      )
    );

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
              }
            : chat
        );
        localStorage.setItem(
          "recentChats",
          JSON.stringify(
            updatedChats.map((chat) => ({
              ...chat,
              time: chat.time.toISOString(),
            }))
          )
        );
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
                <ArrowLeft className="h-4 w-4" />
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
              <ChatMessages
                messages={messages}
                messagesEndRef={messagesEndRef}
              />
            </div>

            <ChatInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading} // Pass isLoading prop
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
