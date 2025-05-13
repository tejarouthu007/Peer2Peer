"use client";
import React, { useState, useRef, useEffect } from "react";
import VideoCall from "@/components/VideoCall";
import ChatBox from "@/components/ChatBox";
import FileShare from "@/components/FileShare";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const SIGNALING_SERVER = "ws://localhost:3001";

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, []);

  const joinRoom = () => {
    wsRef.current = new WebSocket(SIGNALING_SERVER);

    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({ type: "join", room: roomCode }));
      initPeer();
      setJoined(true);
      console.log('Joined room:', roomCode);
    };

    wsRef.current.onmessage = async (message) => {
      const { type, data } = JSON.parse(message.data);

      if (type === "signal") {
        await handleSignal(data);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
    };
  };

  const handleSignal = async (data: any) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.sdp) {
      const desc = new RTCSessionDescription(data.sdp);
      await pc.setRemoteDescription(desc);

      if (desc.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ sdp: pc.localDescription });
      }
    } else if (data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const sendSignal = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "signal", room: roomCode, data }));
    }
  };

  const initPeer = () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      const remoteVideo = document.getElementById("remote") as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = e.streams[0];
      }
    };

    pcRef.current = pc;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      {!joined ? (
        <div className="space-y-4">
          <input
            className="border p-2"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={joinRoom}
          >
            Join
          </button>
        </div>
      ) : (
        <>
          <p className="text-green-600 mb-2">Joined room: {roomCode}</p>
          <VideoCall pcRef={pcRef} sendSignal={sendSignal} />
          {/* <ChatBox ws={wsRef.current} roomCode={roomCode} />
          <FileShare ws={wsRef.current} roomCode={roomCode} /> */}
        </>
      )}
    </main>
  );
}
