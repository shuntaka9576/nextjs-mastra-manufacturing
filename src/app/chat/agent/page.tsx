"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useState } from "react";

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status, stop } =
    useChat({
      api: "/api/chat/agent",
    });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>

              <div className="mt-2">
                {message.experimental_attachments
                  ?.filter((attachment) =>
                    attachment.contentType?.startsWith("image/"),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-h-40 rounded"
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {(status === "submitted" || status === "streaming") && (
          <div className="py-2 flex items-center justify-between">
            {status === "submitted" && (
              <p className="text-sm text-gray-500">Generating...</p>
            )}
            <button
              type="button"
              onClick={() => stop()}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full"
            >
              Stop
            </button>
          </div>
        )}

        <form
          onSubmit={(event) => {
            handleSubmit(event, {
              experimental_attachments: files,
              allowEmptySubmit: true,
            });

            setFiles(undefined);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          className="mt-auto py-4"
        >
          <div className="flex gap-2 items-center mb-2">
            <input
              type="file"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              accept="image/*"
              ref={fileInputRef}
              className="text-xs"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              placeholder="Enter your message..."
              onChange={handleInputChange}
              disabled={status !== "ready" && status !== undefined}
              className="flex-1 p-3 rounded-full border border-gray-300"
            />
            <button
              type="submit"
              className="p-3 bg-blue-500 text-white rounded-full"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
