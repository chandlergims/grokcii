'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetHour: number;
  targetMinute: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetHour, targetMinute }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      
      // Set target time to today at the specified hour and minute
      target.setHours(targetHour, targetMinute, 0, 0);
      
      // If the target time has already passed today, set it to tomorrow
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      
      // Calculate the difference in milliseconds
      const difference = target.getTime() - now.getTime();
      
      // Calculate hours, minutes, and seconds
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Format the time left
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Update the time left immediately
    setTimeLeft(calculateTimeLeft());
    
    // Update the time left every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [targetHour, targetMinute]);
  
  return (
    <span>{timeLeft}</span>
  );
};

export default CountdownTimer;
