/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initCrazyGames } from './utils/crazygames';

// Initialize the CrazyGames SDK
initCrazyGames();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
