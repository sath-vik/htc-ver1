import React, { useState, useEffect } from 'react';
import { FiSettings, FiUser, FiEye, FiEyeOff, FiFilter, FiPlus } from 'react-icons/fi';
import './App.css';
import HabitList from './components/HabitList/HabitList';
import CategoryModal from './components/CategoryModal/CategoryModal';
import ConfirmationModal from './components/ConfirmationModal/ConfirmationModal';
import AddHabitPanel from './components/AddHabitPanel/AddHabitPanel';
import TodoList from './components/TodoList/TodoList';
import CalendarView from './components/CalendarView/CalendarView';

const HabitsView = ({ habits, categories, activeCategory, setActiveCategory, onAddCategory, onDeleteCategory, filterType, showCompleted, onToggleShowCompleted, onFilterChange, showFilterMenu, setShowFilterMenu, completeHabit, resetHabit, onAddHabit, onEditHabit, onDeleteHabit }) => {
  const filteredHabits = habits.filter(habit => {
    const isCompleted = habit.dailyCompletions >= habit.targetCompletions;
    if (habit.category !== activeCategory) return false;
    if (!showCompleted && isCompleted) return false;
    if (filterType === 'ongoing' && isCompleted) return false;
    if (filterType === 'completed' && !isCompleted) return false;
    return true;
  });

  return (
    <>
      <div className="top-bar">
        <nav className="category-nav">
          {categories.map(category => (
            <div key={category} className="nav-button-group">
              <button onClick={() => setActiveCategory(category)} className={`nav-button ${activeCategory === category ? 'active' : ''}`}>{category}</button>
              <button onClick={() => onDeleteCategory(category)} className="delete-category-btn">
                <span className="cross-icon">×</span>
              </button>
            </div>
          ))}
          <button onClick={onAddCategory} className="icon-button add-category-btn">
            <FiPlus />
          </button>
        </nav>

        <div className="actions-toolbar">
          <button className="icon-button" onClick={onToggleShowCompleted}>
            {showCompleted ? <FiEye /> : <FiEyeOff />}
          </button>
          <div className="filter-menu">
            <button className="icon-button" onClick={() => setShowFilterMenu(!showFilterMenu)}><FiFilter /></button>
            {showFilterMenu && (
              <div className="filter-options">
                <div className="filter-option" onClick={() => onFilterChange('all')}>All Habits</div>
                <div className="filter-option" onClick={() => onFilterChange('ongoing')}>On-going</div>
                <div className="filter-option" onClick={() => onFilterChange('completed')}>Completed</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="main-layout-container">
        <HabitList
          habits={filteredHabits}
          completeHabit={completeHabit}
          resetHabit={resetHabit}
          onAddHabitClick={onAddHabit}
          onEditHabit={onEditHabit}
          onDeleteHabit={onDeleteHabit}
        />
      </div>
    </>
  );
};

function App() {
  const [activeView, setActiveView] = useState('habits'); // 'habits', 'todo', 'calendar'
  const [habits, setHabits] = useState([]);
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState(['Daily', 'Health', 'Study']);
  const [activeCategory, setActiveCategory] = useState('Daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHabitConfirmModalOpen, setIsHabitConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [totalCoins, setTotalCoins] = useState(10);
  const [lastIncrement, setLastIncrement] = useState(null);
  const [animationTimer, setAnimationTimer] = useState(null);

  const [showCompleted, setShowCompleted] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [notification, setNotification] = useState('');

  const filterTitles = {
    all: 'All Habits',
    ongoing: 'On-going Habits',
    completed: 'Completed Habits',
  };
  
  const headerTitle = activeView === 'habits' ? filterTitles[filterType] : (activeView.charAt(0).toUpperCase() + activeView.slice(1));

  useEffect(() => {
    setHabits([
      { id: 1, text: 'Exercise', icon: '🏃', coins: 0.3, penalty: 0.1, targetCompletions: 10, dailyCompletions: 3, category: 'Daily' },
      { id: 2, text: 'Read a book', icon: '📚', coins: 0.5, penalty: 0.2, targetCompletions: 1, dailyCompletions: 1, category: 'Study' },
      { id: 3, text: 'Meditate', icon: '🧘', coins: 0.2, penalty: 0.1, targetCompletions: 1, dailyCompletions: 0, category: 'Health' },
    ]);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const completeHabit = (id) => {
    let coinGained = 0;
    setHabits(habits.map(habit => {
      if (habit.id === id && habit.dailyCompletions < habit.targetCompletions) {
        coinGained = habit.coins;
        return { ...habit, dailyCompletions: habit.dailyCompletions + 1 };
      }
      return habit;
    }));

    if (coinGained > 0) {
      setTotalCoins(prevCoins => prevCoins + coinGained);
      if (animationTimer) clearTimeout(animationTimer);
      setLastIncrement({ amount: coinGained, key: Date.now() });
      const timer = setTimeout(() => setLastIncrement(null), 1500);
      setAnimationTimer(timer);
    }
  };

  const resetHabit = (id) => {
    let coinsToDeduct = 0;
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        coinsToDeduct = habit.coins * habit.dailyCompletions;
        return { ...habit, dailyCompletions: 0 };
      }
      return habit;
    }));
    if (coinsToDeduct > 0) {
      setTotalCoins(prevCoins => prevCoins - coinsToDeduct);
    }
  };

  const completeTodo = (id, isCompleted) => {
    let pointsChanged = 0;
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        pointsChanged = todo.points;
        return { ...todo, isCompleted: !isCompleted };
      }
      return todo;
    }));

    if (isCompleted) {
      setTotalCoins(prevCoins => prevCoins - pointsChanged);
    } else {
      setTotalCoins(prevCoins => prevCoins + pointsChanged);
    }
  };

  const addHabit = (newHabit) => {
    const habitToAdd = { ...newHabit, id: Date.now(), dailyCompletions: 0, completions: [], category: activeCategory };
    setHabits([...habits, habitToAdd]);
    setIsAddPanelOpen(false);
  };

  const editHabit = (updatedHabit) => {
    setHabits(habits.map(habit => (habit.id === updatedHabit.id ? updatedHabit : habit)));
    setEditingHabit(null);
    setIsAddPanelOpen(false);
  };

  const deleteHabit = (id) => {
    setHabitToDelete(id);
    setIsHabitConfirmModalOpen(true);
  };

  const confirmDeleteHabit = () => {
    setHabits(habits.filter(habit => habit.id !== habitToDelete));
    setIsHabitConfirmModalOpen(false);
    setHabitToDelete(null);
  }

  const openAddHabitPanel = () => {
    setEditingHabit(null);
    setIsAddPanelOpen(true);
  };

  const openEditHabitPanel = (habit) => {
    setEditingHabit(habit);
    setIsAddPanelOpen(true);
  };

  const addCategory = () => setIsModalOpen(true);
  
  const handleAddCategory = (newCategory) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setActiveCategory(newCategory);
    }
    setIsModalOpen(false);
  };
  
  const handleDeleteRequest = (category) => {
    setShowFilterMenu(false);
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    const newCategories = categories.filter(c => c !== categoryToDelete);
    setHabits(habits.filter(habit => habit.category !== categoryToDelete));
    setCategories(newCategories);
  
    if (activeCategory === categoryToDelete) {
      if (newCategories.length > 0) {
        setActiveCategory(newCategories[0]);
      } else {
        const newUntitledCategory = 'Untitled';
        setCategories([newUntitledCategory]);
        setActiveCategory(newUntitledCategory);
      }
    }
  
    setIsConfirmModalOpen(false);
    setCategoryToDelete(null);
  };
  
  const toggleShowCompleted = () => {
    setShowFilterMenu(false);
    setNotification(showCompleted ? 'Hiding completed habits' : 'Showing completed habits');
    setShowCompleted(!showCompleted);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setShowFilterMenu(false);
    setNotification(`Showing: ${filterTitles[type]}`);
  };
  
  const renderActiveView = () => {
    switch (activeView) {
      case 'todo':
        return <TodoList todos={todos} setTodos={setTodos} completeTodo={completeTodo} setTotalCoins={setTotalCoins} />;
      case 'calendar':
        return <CalendarView />;
      case 'habits':
      default:
        return (
          <HabitsView
            habits={habits}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onAddCategory={addCategory}
            onDeleteCategory={handleDeleteRequest}
            filterType={filterType}
            showCompleted={showCompleted}
            onToggleShowCompleted={toggleShowCompleted}
            onFilterChange={handleFilterChange}
            showFilterMenu={showFilterMenu}
            setShowFilterMenu={setShowFilterMenu}
            completeHabit={completeHabit}
            resetHabit={resetHabit}
            onAddHabit={openAddHabitPanel}
            onEditHabit={openEditHabitPanel}
            onDeleteHabit={deleteHabit}
          />
        );
    }
  };

  return (
    <div className="App">
      {isModalOpen && <CategoryModal onAdd={handleAddCategory} onCancel={() => setIsModalOpen(false)} />}
      {isConfirmModalOpen && (
        <ConfirmationModal
          message={`This will also delete all habits in the "${categoryToDelete}" category.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
      {isHabitConfirmModalOpen && (
        <ConfirmationModal
          message={`Are you sure you want to delete this habit?`}
          onConfirm={confirmDeleteHabit}
          onCancel={() => setIsHabitConfirmModalOpen(false)}
        />
      )}
      <header className="app-header">
        <div className="header-left">
          <button className="icon-button"><FiSettings /></button>
          <span className="header-title">{headerTitle}</span>
        </div>
        <div className="header-right">
          <div className="total-coins-container">
            <span className="total-coins-display">💰 {totalCoins.toFixed(1)}</span>
            {lastIncrement && <span key={lastIncrement.key} className="coin-increment-animation">+{lastIncrement.amount.toFixed(1)}</span>}
          </div>
          <button className="icon-button"><FiUser /></button>
        </div>
      </header>

      <div className="main-nav-container">
        <button className={`main-nav-btn ${activeView === 'habits' ? 'active' : ''}`} onClick={() => setActiveView('habits')}>HABITS</button>
        <button className={`main-nav-btn ${activeView === 'todo' ? 'active' : ''}`} onClick={() => setActiveView('todo')}>TODO</button>
        <button className={`main-nav-btn ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>CALENDAR</button>
      </div>

      <main className="main-content">
        {renderActiveView()}
        {isAddPanelOpen && activeView === 'habits' && (
          <div className="add-habit-panel-section">
            <AddHabitPanel
              onAddHabit={editingHabit ? editHabit : addHabit}
              onCancel={() => setIsAddPanelOpen(false)}
              habit={editingHabit}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;