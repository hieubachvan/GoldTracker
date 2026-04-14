import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { usePriceStore } from '../store/usePriceStore';
import { useEffect } from 'react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Fetch initial latest prices via REST, then realtime via socket
export const useGoldPrice = () => {
  const setPrices = usePriceStore((s) => s.setPrices);

  const query = useQuery({
    queryKey: ['prices', 'latest'],
    queryFn: () => api.get('/api/prices/latest').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) setPrices(query.data);
  }, [query.data]);

  return query;
};

export const useGoldHistory = (source, type) => {
  return useQuery({
    queryKey: ['prices', 'history', source, type],
    queryFn: () =>
      api.get('/api/prices/history', { params: { source, type, limit: 200 } }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    enabled: !!(source && type),
  });
};

export const useForex = () => {
  const setForex = usePriceStore((s) => s.setForex);

  const query = useQuery({
    queryKey: ['forex', 'latest'],
    queryFn: () => api.get('/api/forex/latest').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) setForex(query.data);
  }, [query.data]);

  return query;
};
