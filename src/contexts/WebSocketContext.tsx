import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type Handler<T = any> = (data: T) => void;

interface WSContextValue {
  subscribe: (eventType: string, fn: Handler) => void;
  unsubscribe: (eventType: string, fn: Handler) => void;
}

const WebSocketContext = createContext<WSContextValue | null>(null);

export const WebsocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isReady, token } = useAuth();
  const handlers = useRef(new Map<string, Set<Handler>>());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isReady || !token) return;
    const ws = new WebSocket("ws://localhost:8000/ws/events/");
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ WS connected");
    ws.onclose = () => console.log("❌ WS disconnected");
    ws.onerror = (err) => {
      console.error("🛑 WS error", err);
      ws.close();
    };
    ws.onmessage = (e) => {
      try {
        const { type, data } = JSON.parse(e.data);
        handlers.current.get(type)?.forEach((fn) => fn(data));
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [isReady, token]);

  const subscribe = (eventType: string, fn: Handler) => {
    console.log(`📡 Subscribing to ${eventType}`);
    if (!handlers.current.has(eventType)) {
      handlers.current.set(eventType, new Set());
    }
    handlers.current.get(eventType)!.add(fn);
  };

  const unsubscribe = (eventType: string, fn: Handler) => {
    handlers.current.get(eventType)?.delete(fn);
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebsocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebsocket must be inside WebsocketProvider");
  }
  return ctx;
};
