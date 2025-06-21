import React from "react";
import { Bot, User } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "doctor" | "patient" | "ai";
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  messagesEndRef,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 max-w-2xl mx-auto">
        <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-xl font-semibold mb-2 text-gray-700">
          Start Your Medical Consultation
        </p>
        <p className="text-base mt-1 text-gray-600">
          Ask questions about patient cases, symptoms, treatment protocols, or
          medical procedures.
        </p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-gray-700 text-sm border border-blue-200">
          Example: "I have a patient with acute chest pain and elevated troponin
          levels. What's the recommended treatment protocol?"
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "doctor" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex items-start gap-3 max-w-[75%] ${
              msg.sender === "doctor" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                ${
                  msg.sender === "doctor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {msg.sender === "doctor" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={`rounded-2xl px-4 py-3 shadow-sm
                ${
                  msg.sender === "doctor"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              <p
                className={`text-xs mt-2 opacity-70 ${
                  msg.sender === "doctor" ? "text-left" : "text-right"
                }`}
              >
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
