import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

const CalendarView = ({ onDateChange, selectedDate }) => {
  return (
    <div className="calendar-container">
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
      />
    </div>
  );
};

export default CalendarView;
