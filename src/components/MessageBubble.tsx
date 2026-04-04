"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/core/types/QueryResult";
import { SourceCard } from "./SourceCard";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-3xl flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const isBlock = className?.startsWith("language-");
                  return isBlock ? (
                    <pre className="my-2 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-800"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Sources ({message.sources.length})
            </p>
            <div className="flex flex-col gap-2">
              {message.sources.map((src, i) => (
                <SourceCard key={src.chunk.id} source={src} index={i} />
              ))}
            </div>
          </div>
        )}

        <span className="text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
