
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
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
    <div className="border-t pt-4 bg-white">
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-300 rounded-full shadow-sm flex items-center">
        <textarea
          ref={textareaRef}
          placeholder="Ask anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyPress}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 px-5 py-3 min-h-[56px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none text-base border-none"
          rows={1}
          style={{ overflowY: "hidden" }}
        />
        <div className="flex items-center pr-2">
          <Button
            onClick={onSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
            size="icon"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
