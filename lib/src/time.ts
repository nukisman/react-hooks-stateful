import { useEffect } from 'react';

export const useInterval = (timeout: number, handler: () => void) =>
  useEffect(() => {
    const intervalId = setInterval(handler, timeout);
    return () => clearInterval(intervalId);
  }, []);
