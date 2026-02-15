import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import BankDetailsSetup from './pages/BankDetailsSetup'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Faculty routes */}
          <Route path="/bank-details" element={<BankDetailsSetup />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
