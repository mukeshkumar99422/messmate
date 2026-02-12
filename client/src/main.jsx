import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from './context/AuthContextProvider.jsx'
import { Toaster } from 'react-hot-toast';
import StudentContextProvider from './context/StudentContextProvider.jsx';
import AccountantContextProvider from './context/AccountantContextProvider.jsx';
import AdminContextProvider from './context/AdminContextProvider.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthContextProvider>

        <AdminContextProvider>

          <StudentContextProvider>

          <AccountantContextProvider>
            
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
              }}
            />
            <App />
          </AccountantContextProvider>          
        </StudentContextProvider>
        </AdminContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
)
