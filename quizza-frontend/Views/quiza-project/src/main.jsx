

import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AppContextProvider } from './pages/Mern/context/AppContext.jsx';

createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <App />
    </AppContextProvider>
)

