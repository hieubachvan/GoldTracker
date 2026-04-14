import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { usePriceStore } from '../store/usePriceStore';
import { useQueryClient } from '@tanstack/react-query';

const SERVER_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

export const useSocket = () => {
  const socketRef = useRef(null);
  const { setPrices, setForex, setConnected, setConnectionStatus } = usePriceStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    setConnectionStatus('connecting');
    const socket = io(SERVER_URL, {
      path: '/api/socket.io/',
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      setConnectionStatus('disconnected');
      console.warn('Socket connection error:', err.message);
    });

    socket.on('new_price_data', (data) => {
      setPrices(data);
      // Ép biểu đồ cập nhật lại khi có dữ liệu real-time mới
      queryClient.invalidateQueries({ queryKey: ['prices', 'history'] });
    });

    socket.on('new_forex_data', (data) => {
      setForex(data);
      queryClient.invalidateQueries({ queryKey: ['forex', 'history'] });
    });


    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};
