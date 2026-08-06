import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from './AuthContextProvider';
import AdminContextProvider from './AdminContextProvider';
import StudentContextProvider from './StudentContextProvider';
import AccountantContextProvider from './AccountantContextProvider';
import { Toaster } from 'react-hot-toast';

const GlobalProvider = ({ children }) => (
  <BrowserRouter>
    <AuthContextProvider>
      <AdminContextProvider>
        <StudentContextProvider>
          <AccountantContextProvider>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            {children}
          </AccountantContextProvider>
        </StudentContextProvider>
      </AdminContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
);

export default GlobalProvider;