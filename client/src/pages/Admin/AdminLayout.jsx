import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import Footer from '../../components/common/Footer';

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans antialiased text-gray-900">
      
      {/* Sidebar - Fixed width on Desktop, Collapsed on Mobile */}
      <aside className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area - Dynamic Margin based on Sidebar */}
      <main className="flex-1 flex flex-col transition-all duration-300 ml-20 md:ml-64 min-h-screen">
        
        <div className="flex-1 bg-linear-to-br from-green-50 via-green-50/40 to-white pb-12">
          <Outlet />
        </div>

        <Footer />
        
      </main>
      
    </div>
  );
};