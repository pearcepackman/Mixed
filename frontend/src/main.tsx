import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { shadcn } from '@clerk/ui/themes'
import './index.css'
import '@clerk/ui/themes/shadcn.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{ theme: shadcn }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
