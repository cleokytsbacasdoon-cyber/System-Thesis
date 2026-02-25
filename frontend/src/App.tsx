import { useState } from 'react'
import { ToastProvider } from './contexts/ToastContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { Dashboard } from './pages/Dashboard'
import { SettingsPage } from './pages/Settings'
import { Header } from './components/Header'
import { ToastContainer } from './components/ToastContainer'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard')

  return (
    <DarkModeProvider>
      <ToastProvider>
        <div className="w-full min-h-screen bg-gray-50">
          <Header onSettingsClick={() => setCurrentPage('settings')} />
          
          {currentPage === 'dashboard' && (
            <Dashboard onSettingsClick={() => setCurrentPage('settings')} />
          )}
          
          {currentPage === 'settings' && (
            <div>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="fixed bottom-6 right-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
              >
                ← Back to Dashboard
              </button>
              <SettingsPage />
            </div>
          )}

          <ToastContainer />
        </div>
      </ToastProvider>
    </DarkModeProvider>
  )
}

export default App
