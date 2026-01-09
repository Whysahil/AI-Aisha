import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("Mounting React App...");

// Removing StrictMode and ErrorBoundary temporarily to debug render issues
const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);