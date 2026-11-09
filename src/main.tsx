import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import { GOOGLE_ID } from './components/auth/GoogleSignIn';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_ID || 'not-configured'}>
        <I18nProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </I18nProvider>
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
