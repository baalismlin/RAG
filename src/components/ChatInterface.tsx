"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { ChatMessage, QueryResult } from "@/core/types/QueryResult"
import { MessageBubble } from "./MessageBubble"

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
    </div>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    const userMsg: ChatMessage = { role: "user", content: question, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const result = (await res.json()) as QueryResult
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          R
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Local RAG System</h1>
          <p className="text-xs text-gray-500">Document & Code Q&A · Powered by Ollama</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-500">Local</span>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
              🔍
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Ask anything</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Query your documents and codebase with natural language. The system automatically
                classifies your question and retrieves the most relevant context.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "What is the overall architecture of this project?",
                "How does the RAG service handle query classification?",
                "Explain the CodeStructuralParser class",
                "What file formats are supported for indexing?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-left text-sm text-gray-600 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as FormEvent)
              }
            }}
            placeholder="Ask about your documents or code… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            disabled={loading}
            style={{ minHeight: 48, maxHeight: 200 }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, 200) + "px"
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-gray-400">
          Answers are generated from indexed documents and code only.
        </p>
      </div>
    </div>
  )
}
