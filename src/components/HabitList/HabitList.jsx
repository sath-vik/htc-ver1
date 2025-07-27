import React from 'react';
import { FiPlus } from 'react-icons/fi';
import Habit from '../Habit/Habit';
import './HabitList.css';

const HabitList = ({ habits, categories, completeHabit, resetHabit, onAddHabitClick, onEditHabit, onDeleteHabit, onMoveToCategory, onStats }) => {
    return (
        <div className="habit-list">
            {habits.map(habit => (
                <Habit
                    key={habit.id}
                    habit={habit}
                    categories={categories}
                    completeHabit={completeHabit}
                    resetHabit={resetHabit}
                    onEdit={onEditHabit}
                    onDelete={onDeleteHabit}
                    onMoveToCategory={onMoveToCategory}
                    onStats={onStats}
                />
            ))}
            <div className="add-habit-placeholder" onClick={onAddHabitClick}>
                <FiPlus className="add-icon" />
            </div>
        </div>
    );
};

export default HabitList;