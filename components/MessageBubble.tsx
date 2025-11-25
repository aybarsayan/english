"use client";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

export default function MessageBubble({ message, isUser, isLoading }: MessageBubbleProps) {
  if (isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div className="text-3xl">🤖</div>
        <div className="message-bubble message-bot">
          <div className="loading-dots flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="text-3xl flex-shrink-0">
        {isUser ? "👧" : "🤖"}
      </div>
      <div className={`message-bubble ${isUser ? "message-user" : "message-bot"}`}>
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}
