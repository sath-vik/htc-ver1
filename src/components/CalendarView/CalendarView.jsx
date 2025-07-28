import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CHUNK_SIZE = 30; // Number of days to load at a time
const DAY_COLUMN_WIDTH = 200; // The width of a single day column in pixels
const HOUR_ROW_HEIGHT = 120; // The height of a single hour row in pixels

// Generates a chunk of dates before or after a given date
const generateDateChunk = (baseDate, direction) => {
  const dates = [];
  const start = direction === 'prepend' ? -CHUNK_SIZE : 1;
  const end = direction === 'prepend' ? -1 : CHUNK_SIZE;

  for (let i = start; i <= end; i++) {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() + i);
    dates.push(day);
  }
  if (direction === 'prepend') {
    return dates.reverse();
  }
  return dates;
};

// A more reliable way to get the current time in a specific timezone.
const getTimeInTimeZone = (timeZone) => {
    const now = new Date();
    // Using en-IN locale and h23 hourCycle for more predictable 0-23 hour format.
    const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone,
        hourCycle: 'h23',
        hour: 'numeric',
        minute: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
    return { hour, minute };
}


const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayedDate, setDisplayedDate] = useState(new Date());
  const [dates, setDates] = useState(() => {
    const initialDates = [];
    const today = new Date();
    for (let i = -CHUNK_SIZE; i <= CHUNK_SIZE; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() + i);
        initialDates.push(day);
    }
    return initialDates;
  });

  const [timelineIndicatorPosition, setTimelineIndicatorPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollTimeout = useRef(null);


  const gridRef = useRef(null);
  const headerRef = useRef(null);
  const todayRef = useRef(null);
  const scrollState = useRef({ prevScrollWidth: 0, prevScrollLeft: 0 }).current;


  // Synchronize header scroll with the grid scroll and handle infinite scroll
  const handleGridScroll = () => {
    // Immediate updates on every scroll event
    if (headerRef.current) {
      headerRef.current.scrollLeft = gridRef.current.scrollLeft;
    }

    const { scrollLeft, clientWidth } = gridRef.current;
    const center = scrollLeft + clientWidth / 2;
    const dayIndex = Math.floor(center / DAY_COLUMN_WIDTH);
    if (dates[dayIndex]) {
        const newDate = dates[dayIndex];
        if (newDate.getMonth() !== displayedDate.getMonth() || newDate.getFullYear() !== displayedDate.getFullYear()) {
            setDisplayedDate(newDate);
        }
    }

    // Clear previous timeout to debounce the data loading part
    if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
    }

    // Debounced actions (data loading)
    scrollTimeout.current = setTimeout(() => {
        setIsAnimating(false); // Scrolling has ended
        if (isLoading) return;

        const { scrollLeft, scrollWidth, clientWidth } = gridRef.current; // Re-get latest values

        // Load more future dates
        if (scrollWidth - scrollLeft - clientWidth < 1000) {
          setIsLoading(true);
          const lastDate = dates[dates.length - 1];
          const newDates = generateDateChunk(lastDate, 'append');
          setDates(prevDates => [...prevDates, ...newDates]);
        }

        // Load more past dates
        if (scrollLeft < 1000) {
          setIsLoading(true);
          const firstDate = dates[0];
          scrollState.prevScrollWidth = scrollWidth;
          scrollState.prevScrollLeft = scrollLeft;
          const newDates = generateDateChunk(firstDate, 'prepend');
          setDates(prevDates => [...newDates, ...prevDates]);
        }
    }, 150); // Detect when scrolling has stopped
  };
  
  // This effect runs after the DOM has been updated, but before the browser has painted.
  // It's used to adjust the scroll position seamlessly when new past dates are loaded.
  useLayoutEffect(() => {
    if (isLoading && gridRef.current) {
        const newScrollWidth = gridRef.current.scrollWidth;
        const scrollDiff = newScrollWidth - scrollState.prevScrollWidth;
        
        if(scrollDiff > 0 && scrollState.prevScrollLeft < 1000) {
            gridRef.current.scrollLeft = scrollState.prevScrollLeft + scrollDiff;
        }
        scrollState.prevScrollWidth = 0; // Reset after adjustment
        setIsLoading(false);
    }
  }, [dates, isLoading, scrollState]);

  
  // Effect for Shift + Scroll
  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;
  
    let lastScrollTime = 0;
    const handleWheel = (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTime < 100) return; // Debounce scroll
        lastScrollTime = now;
        
        const scrollDirection = e.deltaY > 0 ? 1 : -1;
        const currentScrollLeft = element.scrollLeft;
        const targetColumn = Math.round(currentScrollLeft / DAY_COLUMN_WIDTH) + scrollDirection;
        const targetScrollLeft = targetColumn * DAY_COLUMN_WIDTH;
        
        element.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    };
  
    element.addEventListener('wheel', handleWheel);
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);
  

  // Effect to scroll to today's date on initial render
  useEffect(() => {
    if (todayRef.current && gridRef.current) {
      const grid = gridRef.current;
      const todayEl = todayRef.current;
      const todayOffset = todayEl.offsetLeft - grid.offsetLeft;
      // Position today as the second column, showing one day from the past.
      const scrollOffset = todayOffset - DAY_COLUMN_WIDTH;
      
      grid.scrollLeft = scrollOffset;
    }
  }, []);
  
  // Effect to update the red "current time" indicator
  useEffect(() => {
    const updateIndicator = () => {
        const { hour, minute } = getTimeInTimeZone('Asia/Kolkata');
        const position = (hour + minute / 60) * HOUR_ROW_HEIGHT;
        setTimelineIndicatorPosition(position);
    };

    updateIndicator();
    const interval = setInterval(updateIndicator, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleScrollButtons = (direction) => {
    if (gridRef.current && !isAnimating) {
        setIsAnimating(true);
        const currentScrollLeft = gridRef.current.scrollLeft;
        const directionMultiplier = direction === 'left' ? -1 : 1;
        const scrollAmountInDays = 4;
        
        // Find the target column's exact starting position
        const targetColumn = Math.round(currentScrollLeft / DAY_COLUMN_WIDTH) + (directionMultiplier * scrollAmountInDays);
        const targetScrollLeft = targetColumn * DAY_COLUMN_WIDTH;

        gridRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
    if (todayRef.current && gridRef.current) {
      const grid = gridRef.current;
      const todayEl = todayRef.current;
      const todayOffset = todayEl.offsetLeft - grid.offsetLeft;
       // Position today as the second column, showing one day from the past.
      const scrollOffset = todayOffset - DAY_COLUMN_WIDTH;
      
      grid.scrollTo({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();

  return (
    <div className="notion-calendar-container">
      <div className="notion-sidebar">
        <div className="sidebar-header">
          <button onClick={handleToday} className="control-button">Today</button>
        </div>
        <Calendar
          value={currentDate}
          onChange={setCurrentDate}
          className="notion-small-calendar"
        />
      </div>

      <div className="notion-main-view">
        <div className="notion-header">
            <div className="header-top">
                <div className="month-year-display">
                    {displayedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="scroll-buttons">
                    <button onClick={() => handleScrollButtons('left')} className="scroll-button left" disabled={isAnimating}><ChevronLeft size={16} /></button>
                    <button onClick={() => handleScrollButtons('right')} className="scroll-button right" disabled={isAnimating}><ChevronRight size={16} /></button>
                </div>
            </div>
          <div className="day-headers-container" ref={headerRef}>
            <div className="time-column-header" />
            {dates.map(day => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={day.toISOString()} className={`day-header ${isToday ? 'today' : ''}`}>
                  <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className={`day-number ${isToday ? 'today' : ''}`}>{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="notion-grid-container" ref={gridRef} onScroll={handleGridScroll}>
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-label">
                <span>
                  {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
                </span>
              </div>
            ))}
          </div>
          <div className="days-grid">
            <div className="timeline-indicator" style={{ top: `${timelineIndicatorPosition}px`, width: `${(dates.length) * DAY_COLUMN_WIDTH}px` }}>
              <div className="timeline-dot"></div>
              <div className="timeline-line"></div>
            </div>
            {dates.map(day => (
              <div key={day.toISOString()} ref={day.toDateString() === today.toDateString() ? todayRef : null} className="day-column">
                {hours.map(hour => <div key={hour} className="hour-slot"></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
