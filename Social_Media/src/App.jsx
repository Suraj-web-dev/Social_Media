import React from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

const App = () => {
  return (
    <div>
      <Toaster position='top-center' reverseOrder={false} />
      <AppRoutes />
    </div>
  )
}

export default App