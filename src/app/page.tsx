"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Plus, Settings, Loader2, LogOut, Square } from "lucide-react";

export default function Home() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<{ id: string; title: string }[]>([
    { id: "default", title: "New Conversation" }
  ]);
  const [activeChatId, setActiveChatId] = useState("default");

  const { messages, status, sendMessage, error, setMessages, stop } = useChat({
    id: activeChatId,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
    }
  }, [error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    
    // Update title if it's the first message
    if (messages.length === 0) {
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, title: currentInput.substring(0, 20) + (currentInput.length > 20 ? '...' : '') } : c));
    }

    sendMessage({ text: currentInput });
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setChats(prev => [{ id: newId, title: "New Conversation" }, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
    setErrorMessage(null);
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setMessages(messages); // Reset internal state
    setErrorMessage(null);
  };

  // Helper to extract text from UIMessage parts
  const getMessageText = (message: any) => {
    if (message.content) return message.content;
    const parts = message.parts || [];
    return parts
      ?.filter((p: any) => p.type === "text")
      ?.map((p: any) => p.text)
      ?.join("") || "";
  };

  if (authStatus === "loading") return <div className="loading-screen">Loading...</div>;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">N</div>
            <h1 className="logo-text">Chat Nova</h1>
          </div>
          <button className="new-chat-btn" onClick={createNewChat} title="New Chat">
            <Plus size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h2 className="section-title">RECENT CHATS</h2>
            <div className="chat-list">
              {chats.map(chat => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat.id)}
                >
                  <span className="chat-item-text">{chat.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "0.9rem", margin: "0" }}>
              {session?.user?.name?.[0] || "U"}
            </div>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{session?.user?.name || "User"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button 
              onClick={() => signOut()}
              className="footer-icon-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button className="footer-icon-btn">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-info">
            <h2 className="chat-title">{chats.find(c => c.id === activeChatId)?.title}</h2>
          </div>
          <ThemeToggle />
        </header>

        <div className="message-list">
          {errorMessage && (
            <div className="error-banner">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)}>&times;</button>
            </div>
          )}
          {messages.length === 0 && !errorMessage && (
            <div className="empty-state">
              <div className="empty-icon">
                 <Plus size={32} />
              </div>
              <h3>Start a new conversation</h3>
              <p>Type your message below to begin chatting with Nova Intelligence.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`message-wrapper ${message.role}`}>
              <div className="message-container">
                <div className="avatar">
                  {message.role === "user" ? (session?.user?.name?.[0] || "U") : "N"}
                </div>
                <div className="message-bubble">
                  {message.role === "user" ? (
                    <p className="message-content">{getMessageText(message)}</p>
                  ) : (
                    <div className="message-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getMessageText(message) || ''}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {status === "streaming" && (
            <div className="message-wrapper assistant">
              <div className="message-container">
                <div className="avatar">N</div>
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form className="input-container" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            {isLoading ? (
              <button 
                type="button" 
                className="stop-button"
                onClick={() => stop()}
                title="Stop Generating"
              >
                <Square size={20} fill="currentColor" />
              </button>
            ) : (
              <button 
                type="submit" 
                className="send-button"
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            )}
          </form>
          <p className="input-info">Powered by Gemini. Verify important AI responses.</p>
        </div>
      </main>
    </div>
  );
}
