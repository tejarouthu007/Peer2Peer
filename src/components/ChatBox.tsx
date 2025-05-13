"use client";
import React, { useState, useEffect } from "react";

interface ChatProps {
  ws: WebSocket | null;
  roomCode: string;
}

export default function ChatBox({ ws, roomCode }: ChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!ws) return;

    const onMessage = (e: MessageEvent) => {
      const { type, room, data } = JSON.parse(e.data);
      if (type === "chat" && room === roomCode) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.addEventListener("message", onMessage);

    return () => {
      ws.removeEventListener("message", onMessage);
    };
  }, [ws, roomCode]);

  const sendMessage = () => {
    if (!input.trim() || !ws) return;
    ws.send(
      JSON.stringify({
        type: "chat",
        room: roomCode,
        data: input,
      })
    );
    setMessages((prev) => [...prev, `You: ${input}`]);
    setInput("");
  };

  return (
    <div className="w-full max-w-md mt-4">
      <div className="h-48 border rounded overflow-y-auto p-2 mb-2 bg-gray-100">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
