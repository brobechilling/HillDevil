import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  sender: string;
  content: string;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const TestWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], 
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    newSocket.on("chat_message", (msg: string) => {
      console.log("Received:", msg);
      setMessages((prev) => [...prev, { sender: "Server", content: msg }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("chat_message", input);
      setMessages((prev) => [...prev, { sender: "You", content: input }]);
      setInput("");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Test WebSocket</h2>
      <p>
        Status:{" "}
        <span style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>

      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #eee",
          padding: 8,
          marginBottom: 12,
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}: </strong>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Enter message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default TestWebSocket;
