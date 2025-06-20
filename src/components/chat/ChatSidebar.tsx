
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageCircle,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Trash2,
} from "lucide-react";

interface ChatSession {
  id: string;
  patientName: string;
  lastMessage: string;
  time: string;
  status: "active" | "completed" | "pending";
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
    <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col bg-white shadow-lg border-r transition-all duration-300 ease-in-out`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <Button
              variant="outline"
              className="flex-1 justify-start mr-2"
              onClick={onNewChat}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0"
          >
            {isSidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </div>

        {!isSidebarCollapsed && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Card className="flex-1 flex flex-col">
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase">
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
              <CardContent className="flex-1 overflow-y-auto space-y-2 px-4">
                {selectedChats.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDeleteSelectedChats}
                    className="w-full mb-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedChats.length})
                  </Button>
                )}
                {filteredChats.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No recent chats. Start a new one!
                  </p>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                        ${
                          currentChatId === chat.id
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-gray-100 text-gray-700"
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
                        onClick={() => onChatSelect(chat.id)}
                      >
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-sm">{chat.patientName}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
