import { useState, useRef, useEffect, CSSProperties } from "react";
import { useConfigurables } from "~/modules/configurables";
import { submit, getList } from "~/modules/agentic";
import type { AgentJobView } from "~/modules/agentic";

export default function ChatPage() {
  const { config, loading } = useConfigurables();
  const [messages, setMessages] = useState<AgentJobView[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setJobsLoading(true);
      const response = await getList({ limit: 50 });
      // Reverse to show oldest first
      setMessages(response.items.reverse());
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Submit the message
      const { jobId } = await submit(userMessage);

      // Add optimistic user message
      setMessages((prev) => [
        ...prev,
        {
          jobId,
          prompt: userMessage,
          status: "PENDING" as const,
          response: null,
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Poll for the response
      let attempt = 0;
      const maxAttempts = 60; // 60 attempts * 500ms = 30 seconds
      const pollInterval = setInterval(async () => {
        attempt++;
        try {
          const response = await getList({ limit: 50 });
          const reversedItems = response.items.reverse();
          setMessages(reversedItems);

          // Check if our job has a response
          const jobResponse = reversedItems.find((msg) => msg.jobId === jobId);
          if (jobResponse && jobResponse.status !== "PENDING") {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }

        if (attempt >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Re-add the input text if it failed
      setInputValue(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || jobsLoading && messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: config.backgroundColor || "#FFFFFF" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: config.brandColor?.primary}}></div>
          <p style={{ color: config.brandColor?.primary }}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen max-h-screen"
      style={{ backgroundColor: config.backgroundColor || "#FFFFFF" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-center border-b px-4 py-4 shadow-sm"
        style={{
          backgroundColor: config.brandColor?.primary || "#3B82F6",
          borderColor: config.brandColor?.secondary || "#1E40AF",
        }}
      >
        {config.logoUrl && (
          <img
            src={config.logoUrl}
            alt={config.appName}
            className="h-8 w-8 mr-2 rounded"
          />
        )}
        <h1 className="text-white text-xl font-bold">
          {config.appName || "SimpleChat"}
        </h1>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <p
                className="text-lg font-medium mb-2"
                style={{ color: config.brandColor?.primary }}
              >
                {config.welcomeMessage || "Welcome to SimpleChat"}
              </p>
              <p className="text-gray-500 text-sm">
                Start typing your message below to begin the conversation.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.jobId} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div
                    className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg rounded-tr-none"
                    style={{
                      backgroundColor: config.brandColor?.primary || "#3B82F6",
                    }}
                  >
                    <p className="text-white text-sm break-words">
                      {message.prompt}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                {message.status !== "PENDING" && (
                  <div className="flex justify-start">
                    <div
                      className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg rounded-tl-none"
                      style={{
                        backgroundColor: "#E5E7EB",
                      }}
                    >
                      {message.error ? (
                        <p className="text-red-600 text-sm">
                          Error: {message.error}
                        </p>
                      ) : (
                        <p className="text-gray-800 text-sm break-words">
                          {typeof message.response?.reply === "string"
                            ? message.response.reply
                            : "..."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {message.status === "PENDING" && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg rounded-tl-none bg-gray-200">
                      <div className="flex space-x-2">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: config.brandColor?.primary,
                          }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: config.brandColor?.primary,
                            animationDelay: "0.1s",
                          }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: config.brandColor?.primary,
                            animationDelay: "0.2s",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t px-4 py-4 bg-white flex gap-2"
        style={{
          borderColor: config.brandColor?.secondary || "#1E40AF",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder={
            config.messagePlaceholder || "Type your message here..."
          }
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
          style={
            {
              borderColor: config.brandColor?.accent || "#93C5FD",
            } as CSSProperties
          }
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-6 py-2 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: config.brandColor?.primary || "#3B82F6",
          }}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
