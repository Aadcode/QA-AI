import React, { useState, useRef, useEffect } from "react";

const Chat: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Automatically adjust the height of the textarea based on the content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"; // Reset height to calculate scrollHeight
      textAreaRef.current.style.height = `${Math.max(
        96,
        textAreaRef.current.scrollHeight
      )}px`; // Set height based on content, ensuring minimum height
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add the user message to the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, isUser: true },
      ]);
      setInputValue(""); // Clear the input field

      // Simulate bot response after a brief delay
      setTimeout(() => {
        const botResponse = `Response to: "${inputValue}"`; // Replace with actual response logic
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, isUser: false },
        ]);
      }, 1000); // Simulate a delay for the bot response
    }
  };

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-black h-screen w-full flex flex-col justify-between p-6 overflow-hidden">
      <div className="text-3xl text-white mb-4 text-center">
        What Can I Help You With?
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.isUser
                  ? "bg-blue-500 text-white self-end "
                  : "bg-gray-700 text-white self-start"
              }`}
              style={{
                maxWidth: "70%",
                alignSelf: message.isUser ? "flex-end" : "flex-start",
                wordWrap: "break-word",
              }}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
        </div>
      </div>
      <div className="flex justify-center gap-2 items-center">
        <textarea
          ref={textAreaRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your question here..."
          className="p-2 w-3/4 outline-none rounded-xl border border-slate-400 text-white bg-gray-800 resize-none"
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          ➔
        </button>
      </div>
    </div>
  );
};

export default Chat;
