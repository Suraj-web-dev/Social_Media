import React from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

const App = () => {
  return (
    <div>
      <Toaster
        position='top-center'
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 23, 42, 0.88)',
            color: '#f8fafc',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 18px',
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AppRoutes />
    </div>
  )
}

export default App