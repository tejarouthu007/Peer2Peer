"use client";
import React from "react";

interface FileShareProps {
  ws: WebSocket | null;
  roomCode: string;
}

export default function FileShare({ ws, roomCode }: FileShareProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ws) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      ws.send(
        JSON.stringify({
          type: "file",
          room: roomCode,
          data: {
            name: file.name,
            content: base64,
          },
        })
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-4">
      <label className="block font-medium mb-1">Send a File:</label>
      <input
        type="file"
        onChange={handleFileChange}
        className="block border p-2 rounded w-full"
      />
    </div>
  );
}
