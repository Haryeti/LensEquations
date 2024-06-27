import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);

export const CardContent = ({ children }) => (
  <div>{children}</div>
);