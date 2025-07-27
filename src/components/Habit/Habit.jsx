import React, { useState } from 'react';
import { FiTrendingUp, FiRefreshCw, FiX, FiMoreHorizontal } from 'react-icons/fi';
import './Habit.css';

const Habit = ({ habit, completeHabit, resetHabit, onEdit, onDelete }) => {
    const isCompleted = habit.dailyCompletions >= habit.targetCompletions;
    const [isAnimating, setIsAnimating] = useState(false);

    const goToStats = () => alert(`Navigating to stats for ${habit.text}`);

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    const handleHabitClick = () => {
        if (!isCompleted) {
            completeHabit(habit.id);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    return (
        <div
            className={`habit-item ${isCompleted ? 'completed' : ''} ${isAnimating ? 'thrust' : ''}`}
            onClick={handleHabitClick}
        >
            <div className="habit-content">
                <span className="habit-icon">{habit.icon}</span>
                <span className="habit-text">{habit.text}</span>
            </div>

            <div className="habit-progress-container">
                <span className="habit-coins">💰 {habit.coins}</span>
                <span className="habit-progress">
                    {habit.dailyCompletions}/{habit.targetCompletions}
                </span>
            </div>

            <div className="habit-hover-overlay">
                <div className="habit-actions">
                    <div className="hover-action delete-action" onClick={(e) => handleActionClick(e, () => onDelete(habit.id))}>
                        <FiX />
                    </div>
                    <div className="hover-action" onClick={(e) => handleActionClick(e, () => onEdit(habit))}>
                        <FiMoreHorizontal />
                    </div>
                    <div className="hover-action" onClick={(e) => handleActionClick(e, goToStats)}>
                        <FiTrendingUp />
                    </div>
                    <div className="hover-action" onClick={(e) => handleActionClick(e, () => resetHabit(habit.id))}>
                        <FiRefreshCw />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Habit;