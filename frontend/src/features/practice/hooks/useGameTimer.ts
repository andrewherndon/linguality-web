// src/features-real/practice/hooks/useGameTimer.ts
import { useState, useEffect, useCallback } from 'react';

export const useGameTimer = (initialTime = 0, autoStart = false) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const start = useCallback(() => {
    setIsRunning(true);
    setStartTime(Date.now() - elapsedTime);
  }, [elapsedTime]);
  
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const reset = useCallback(() => {
    setElapsedTime(0);
    setIsRunning(false);
    setStartTime(null);
  }, []);
  
  const stop = useCallback(() => {
    setIsRunning(false);
    return elapsedTime;
  }, [elapsedTime]);
  
  useEffect(() => {
    let intervalId: number;
    
    if (isRunning) {
      intervalId = window.setInterval(() => {
        if (startTime !== null) {
          setElapsedTime(Date.now() - startTime);
        }
      }, 10); // Update every 10ms for smooth timing
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, startTime]);
  
  return {
    elapsedTime,
    isRunning,
    start,
    pause,
    reset,
    stop,
    formattedTime: {
      minutes: Math.floor(elapsedTime / 60000),
      seconds: Math.floor((elapsedTime % 60000) / 1000),
      milliseconds: Math.floor((elapsedTime % 1000) / 10)
    }
  };
};