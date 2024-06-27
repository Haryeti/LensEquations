import React from 'react';

export const Switch = ({ id, checked, onCheckedChange }) => (
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div className={`block bg-gray-600 w-14 h-8 rounded-full ${checked ? 'bg-green-400' : ''}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'transform translate-x-6' : ''}`}></div>
    </div>
  </label>
);