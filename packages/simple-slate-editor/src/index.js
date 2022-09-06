import React from 'react';
import { render } from 'react-dom'
import './index.css';
import App from './App';

const root = document.getElementById('root');
render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  root
);
