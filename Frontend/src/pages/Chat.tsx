import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

import { Socket, io as ioClient } from "socket.io-client";

interface Message {
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

interface ChatProps {
  serverUrl?: string;
  initialMessages?: Message[];
  maxInputHeight?: number;
}

const Chat: React.FC<ChatProps> = ({
  serverUrl = "http://localhost:3000",
  initialMessages = [],
  maxInputHeight = 200,
}) => {
  // State
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Refs
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    try {
      // Socket.io connection setup
      socketRef.current = ioClient(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Socket event handlers
      socketRef.current.on("connect", () => {
        setIsConnected(true);
        setError("");
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        setError("Disconnected from server. Attempting to reconnect...");
      });

      socketRef.current.on("connect_error", (err: Error) => {
        setError(`Connection error: ${err.message}`);
      });

      socketRef.current.on("answer", (answer: string) => {
        const newMessage: Message = {
          text: answer,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(false);
      });

      // Cleanup on unmount
      return () => {
        socketRef.current?.disconnect();
        socketRef.current?.removeAllListeners();
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to initialize chat: ${errorMessage}`);
    }
  }, [serverUrl]);

  const adjustTextAreaHeight = (): void => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(
        Math.max(96, textAreaRef.current.scrollHeight),
        maxInputHeight
      )}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(e.target.value);
    adjustTextAreaHeight();
  };

  const handleSendMessage = async (): Promise<void> => {
    if (inputValue.trim() && socketRef.current?.connected) {
      try {
        setIsLoading(true);
        const newMessage: Message = {
          text: inputValue.trim(),
          isUser: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        socketRef.current.emit("question", newMessage.text);
        setInputValue("");
        adjustTextAreaHeight();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderMessage = (message: Message, index: number): JSX.Element => (
    <div
      key={`${index}-${message.timestamp?.getTime() ?? index}`}
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-3 rounded-lg max-w-[70%] ${
          message.isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.timestamp && (
          <span className="text-xs opacity-70 mt-1 block">
            {message.timestamp.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            aria-label={isConnected ? "Connected" : "Disconnected"}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" role="log" aria-live="polite">
        {error && <div>Error</div>}

        <div className="flex flex-col gap-4">
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            aria-label="Message input"
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={() => void handleSendMessage()}
            disabled={!isConnected || isLoading || !inputValue.trim()}
            aria-label={isLoading ? "Sending message..." : "Send message"}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
