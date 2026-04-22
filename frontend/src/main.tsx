import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Toaster } from 'react-hot-toast';

import { Provider } from 'react-redux';
import store from './redux/store';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
     <Toaster position="top-center" reverseOrder={false} />
     <Provider store={store}>
      <App />
     </Provider>
  </StrictMode>,
)
