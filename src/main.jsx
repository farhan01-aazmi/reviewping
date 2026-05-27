import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ThemeProvider } from './data/ThemeProvider'

Sentry.init({
  dsn: "https://d6d14d34380ba55eeb322339d776fe66@o4511460334829568.ingest.us.sentry.io/4511460362092544",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE || 'production',
  sendDefaultPii: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </HelmetProvider>
    </ThemeProvider>
  </StrictMode>,
)
