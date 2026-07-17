import { jsx as _jsx } from "react/jsx-runtime";
import "./index.css"; // Rules from index.css loaded here
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
