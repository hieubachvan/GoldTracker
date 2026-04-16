import { useState, useEffect, useCallback } from 'react';

// Format API REST: https://api.investing.com/api/financialdata/{pid}/historical/chart/?interval=PT15M&pointscount=160
// WS: wss://streaming.forexpros.com/echo/{server}/{session}/websocket

export function useWorldPrice(pid) {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch lịch sử
  const fetchHistory = useCallback(async () => {
    if (!pid) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`https://api.investing.com/api/financialdata/${pid}/historical/chart/?interval=PT15M&pointscount=160`);
      if (!res.ok) throw new Error('Network error or blocked by CORS');
      const json = await res.json();
      
      const dataArray = Array.isArray(json) ? json : (json.data || []);
      
      const formatted = dataArray.map(item => {
        if (Array.isArray(item) && item.length >= 5) {
          return {
            time: item[0],
            price: item[4],
            high: item[2],
            low: item[3],
          };
        }
        return {
          time: item.timestamp || item.time || Date.now(),
          price: item.close || item.price || item.last_numeric,
        };
      }).filter(item => item.price);
      
      setHistory(formatted);
    } catch (err) {
      console.error(`Fetch history error for pid ${pid}:`, err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pid]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!pid) {
      setHistory([]);
      setCurrent(null);
      return;
    }

    let ws = null;
    let reconnectTimeout = null;
    let isCancelled = false;

    const connectWS = () => {
      if (isCancelled) return;

      const server = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const session = Math.random().toString(36).substring(2, 10);
      const wsUrl = `wss://streaming.forexpros.com/echo/${server}/${session}/websocket`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isCancelled) {
          ws.close();
          return;
        }
        console.log(`Investing WS Connected for pid ${pid}`);
      };

      ws.onmessage = (event) => {
        if (isCancelled) return;
        
        const msg = event.data;
        
        if (msg === 'o') {
          // Send subscribe
          const subscribeMsg = JSON.stringify([JSON.stringify({
            _event: 'bulk-subscribe',
            tzID: 8,
            message: `pid-${pid}:` 
          })]);
          ws.send(subscribeMsg);
        } else if (msg.startsWith('a[')) {
          try {
            const payloadArray = JSON.parse(msg.slice(1));
            const innerStr = payloadArray[0];
            const parsedInner = JSON.parse(innerStr);
            
            if (parsedInner.message && parsedInner.message.includes(`pid-${pid}::`)) {
              const dataStr = parsedInner.message.split(`pid-${pid}::`)[1];
              const data = JSON.parse(dataStr);
              
              if (data.last_numeric) {
                const newCurrent = {
                  price: parseFloat(data.last_numeric),
                  bid: parseFloat(data.bid?.replace(/,/g, '')),
                  ask: parseFloat(data.ask?.replace(/,/g, '')),
                  high: parseFloat(data.high?.replace(/,/g, '')),
                  low: parseFloat(data.low?.replace(/,/g, '')),
                  time: data.timestamp * 1000,
                };
                
                setCurrent(newCurrent);
                
                setHistory(prev => {
                  const now = Date.now();
                  const last = prev[prev.length - 1];
                  if (last && (now - last.time < 60000)) {
                    const newH = [...prev];
                    newH[newH.length - 1] = { ...last, price: newCurrent.price };
                    return newH;
                  }
                  return [...prev, { time: now, price: newCurrent.price }];
                });
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        }
      };

      ws.onerror = (err) => {
        if (isCancelled) return;
        console.error(`Investing WS Error for pid ${pid}:`, err);
      };

      ws.onclose = () => {
        if (isCancelled) return;
        console.log(`Investing WS Disconnected for pid ${pid}, retrying...`);
        reconnectTimeout = setTimeout(connectWS, 5000);
      };
    };

    fetchHistory();
    connectWS();

    return () => {
      isCancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [pid, fetchHistory]);

  return { history, current, isLoading, error };
}
