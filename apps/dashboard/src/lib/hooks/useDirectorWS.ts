
import { useEffect, useState, useRef, useCallback } from 'react';

const DIRECTOR_WS_URL = process.env.NEXT_PUBLIC_DIRECTOR_WS_URL || 'ws://localhost:8080/ws';
const RECONNECT_INTERVAL_MS = 3000; // 3 seconds

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export const useDirectorWS = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(DIRECTOR_WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(event.data);
        setMessage(parsedMessage);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, RECONNECT_INTERVAL_MS);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close(); // Force close to trigger onclose and reconnect logic
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, message };
};
