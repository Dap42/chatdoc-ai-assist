import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react"; // Import Loader2 for spinning icon

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border-2 border-gray-300 rounded-xl flex items-center">
      <textarea
        ref={textareaRef}
        placeholder="Ask anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyPress}
        className="flex-1 bg-white text-gray-900 placeholder-gray-500 px-6 py-4 min-h-[60px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none text-base border-none rounded-xl"
        rows={1}
        style={{
          overflowY: "hidden",
          fontWeight: "500",
        }}
        disabled={isLoading} // Disable textarea when loading
      />
      <div className="flex items-center pr-3">
        <Button
          onClick={onSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-md"
          size="icon"
          disabled={!message.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" /> // Spinning icon when loading
          ) : (
            <Send className="h-5 w-5" /> // Send icon when not loading
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
