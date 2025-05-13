"use client";
import React from "react";

interface VideoCallProps {
  pcRef: React.RefObject<RTCPeerConnection | null>;
  sendSignal: (data: any) => void;
}

export default function VideoCall({ pcRef, sendSignal }: VideoCallProps) {
  const startCall = async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const localVideo = document.getElementById("local") as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ sdp: offer });
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={startCall}
      >
        Start Call
      </button>
      <div className="flex gap-4 justify-center w-full">
        <video
          id="local"
          autoPlay
          playsInline
          muted
          className="w-1/2 rounded border"
        />
        <video
          id="remote"
          autoPlay
          playsInline
          className="w-1/2 rounded border"
        />
      </div>
    </div>
  );
}
