import React from 'react';

const Dropdown = ({ options, setSelected, selected, className }) => {
  return (
    <div className={`bg-gray-800 text-white rounded shadow-lg ${className}`}>
      {options.map((option) => (
        <div
          key={option}
          onClick={() => setSelected(option)}
          className={`p-2 cursor-pointer hover:bg-gray-700 ${selected === option ? 'bg-gray-700' : ''}`}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default Dropdown;