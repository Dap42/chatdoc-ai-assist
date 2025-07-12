import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageCircle,
  Search,
  Trash2,
  Plus,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../../logo.png"; // Import the logo image

import { formatTimestamp } from "@/lib/utils";

interface ChatSession {
  id: string;
  patientName: string;
  lastMessage: string;
  time: Date;
}

interface ChatSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  recentChats: ChatSession[];
  selectedChats: string[];
  setSelectedChats: (chats: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentChatId?: string;
  onNewChat: () => void;
  onChatSelect: (chatId: string) => void;
  onDeleteSelectedChats: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  recentChats,
  selectedChats,
  setSelectedChats,
  searchTerm,
  setSearchTerm,
  currentChatId,
  onNewChat,
  onChatSelect,
  onDeleteSelectedChats,
}) => {
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
    setSelectedChats(
      isChecked
        ? [...selectedChats, chatId]
        : selectedChats.filter((id) => id !== chatId)
    );
  };

  return (
    <div
      className={`${
        isSidebarCollapsed ? "w-16" : "w-80"
      } flex flex-col bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Logo and Collapse Button */}
        <div className="flex items-center justify-between mb-6">
          {!isSidebarCollapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="ChatDoc AI Assist Logo"
                className="h-11 w-15"
              />
              <span className="text-xl font-bold text-gray-900">
                ChatDoc AI
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex-shrink-0 hover:bg-gray-100 ${
              !isSidebarCollapsed && "ml-auto"
            }`}
          >
            {isSidebarCollapsed ? (
              <PanelRight className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* New Chat Button */}
        {!isSidebarCollapsed && (
          <Button
            variant="default"
            className="w-full justify-center mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={onNewChat}
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        )}

        {!isSidebarCollapsed && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                className="w-full pl-9 border-gray-300 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Chats List */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Recent Consultations
                </h3>
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
                      className="text-xs font-medium text-gray-600"
                    >
                      All
                    </label>
                  </div>
                )}
              </div>

              {/* Delete Selected Button */}
              {selectedChats.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteSelectedChats}
                  className="w-full mb-3"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedChats.length})
                </Button>
              )}

              {/* Chat Items */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredChats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">
                      {searchTerm
                        ? "No chats found"
                        : "No recent chats. Start a new one!"}
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border
                        ${
                          currentChatId === chat.id
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-200"
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
                        className="flex-1 flex items-start space-x-3 min-w-0"
                        onClick={() => onChatSelect(chat.id)}
                      >
                        <MessageCircle className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {chat.patientName}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(chat.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
