'use client';
import { useState, useEffect } from 'react';
import styles from './EventWindowsSlider.module.css';

interface EventSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface EventWindowsSliderProps {
  eventId: string;
  sessions: EventSession[];
  defaultSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

const EventWindowsSlider = ({ eventId, sessions, defaultSessionId, onSessionChange }: EventWindowsSliderProps) => {
  const [activeSessionId, setActiveSessionId] = useState<string>(defaultSessionId || (sessions.length > 0 ? sessions[0].id : ''));
  const [visibleSessions, setVisibleSessions] = useState<EventSession[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  
  // Number of sessions to show at once (adjust based on screen size)
  const visibleCount = 5;
  
  useEffect(() => {
    // Update visible sessions based on start index
    updateVisibleSessions();
  }, [startIndex, sessions]);
  
  const updateVisibleSessions = () => {
    const endIndex = Math.min(startIndex + visibleCount, sessions.length);
    setVisibleSessions(sessions.slice(startIndex, endIndex));
  };
  
  const handlePrevious = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (startIndex + visibleCount < sessions.length) {
      setStartIndex(startIndex + 1);
    }
  };
  
  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId);
    
    // Call the onSessionChange callback if provided
    if (onSessionChange) {
      onSessionChange(sessionId);
    }
  };
  
  return (
    <div className={styles.eventWindowsContainer}>
      <div className={styles.sliderWrapper}>
        {/* Left Arrow */}
        <button 
          onClick={handlePrevious}
          disabled={startIndex === 0}
          className={styles.arrowButton}
        >
          <svg viewBox="0 0 36 36" width="24" height="24" fill="currentColor">
            <path d="M0,0H36V36H0Z" fill="none"></path>
            <path d="M30,16.5H11.74l8.38-8.38L18,6,6,18,18,30l2.12-2.12L11.74,19.5H30Z"></path>
          </svg>
        </button>
        
        {/* Sessions */}
        <div className={styles.sessionsContainer}>
          <div className={styles.sessionsWrapper}>
            {visibleSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className={`${styles.sessionItem} ${activeSessionId === session.id ? styles.sessionItemActive : ''}`}
              >
                <div>
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <time className={styles.sessionDate}>{session.date}</time>
                  <span className={styles.sessionTime}>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right Arrow */}
        <button 
          onClick={handleNext}
          disabled={startIndex + visibleCount >= sessions.length}
          className={styles.arrowButton}
        >
          <svg viewBox="0 0 36 36" width="24" height="24" fill="currentColor">
            <path d="M0,0H36V36H0Z" fill="none"></path>
            <path d="M18,6,15.88,8.12l8.38,8.38H6v3H24.26l-8.38,8.38L18,30,30,18Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EventWindowsSlider;
