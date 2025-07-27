import React, { useState } from 'react';
import './CategoryModal.css';

const CategoryModal = ({ onAdd, onCancel }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleAdd = () => {
    if (categoryName.trim() !== '') {
      onAdd(categoryName);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>New Category</h2>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          autoFocus
        />
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={handleAdd} className="add-btn">Add</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
