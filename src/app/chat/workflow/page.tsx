"use client";

import { PhotoIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    setIsLoading(true);
    const imageUrl = selectedImage
      ? URL.createObjectURL(selectedImage)
      : undefined;
    const userContent = inputText.trim() || "";

    try {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: userContent,
          role: "user",
          timestamp: new Date(),
          hasImage: !!selectedImage,
          imageUrl,
        },
      ]);

      const formData = new FormData();
      if (userContent) formData.append("message", userContent);
      if (selectedImage) formData.append("image", selectedImage);

      const response = await fetch("/api/chat/workflow", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.content || "応答がありませんでした",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setInputText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center">
      <div className="w-full max-w-2xl flex flex-col min-h-screen px-4">
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[85%]"
                  : "bg-white border border-gray-200 max-w-[85%]"
              }`}
            >
              {message.content && (
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              )}

              {message.hasImage && message.imageUrl && (
                <div className={message.content ? "mt-2" : ""}>
                  <img
                    src={message.imageUrl}
                    alt="送信画像"
                    className="max-h-40 rounded"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>

        {isLoading && <p className="text-sm text-gray-500 py-2">生成中...</p>}

        <form onSubmit={handleSendMessage} className="mt-auto py-4">
          {selectedImage && (
            <div className="mb-2 text-xs text-gray-600">
              {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-2 text-gray-500"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
            >
              <PhotoIcon width={20} height={20} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files?.[0] && setSelectedImage(e.target.files[0])
              }
              accept="image/*"
              className="hidden"
            />

            <input
              type="text"
              value={inputText}
              placeholder="Enter your message..."
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 p-3 rounded-lg border border-gray-300"
            />

            <button
              type="submit"
              className="p-3 bg-blue-500 text-white rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
