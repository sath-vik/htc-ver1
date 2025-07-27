import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: y, left: x }}
    >
      <ul>
        {options.map((option, index) => (
          <li key={index} onClick={() => { option.action(); onClose(); }}>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
