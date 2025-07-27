import React from 'react';
import Habit from '../Habit/Habit';
import './HabitList.css';

const HabitList = ({ habits, completeHabit, resetHabit, onAddHabitClick, onEditHabit, onDeleteHabit }) => {
  // Sort habits so that incomplete ones are first
  const sortedHabits = [...habits].sort((a, b) => {
    const aCompleted = a.dailyCompletions >= a.targetCompletions;
    const bCompleted = b.dailyCompletions >= b.targetCompletions;
    return aCompleted - bCompleted;
  });

  return (
    <div className="habit-list-container">
      <div className="habits">
        {sortedHabits.map(habit => (
          <Habit
            key={habit.id}
            habit={habit}
            completeHabit={completeHabit}
            resetHabit={resetHabit}
            onEdit={onEditHabit}
            onDelete={onDeleteHabit}
          />
        ))}
        <button onClick={onAddHabitClick} className="add-habit-btn">+</button>
      </div>
    </div>
  );
};

export default HabitList;
