/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from 'react';
import AdminContext from '../../context/AdminContext';
import ItemsNotUpdated from '../../components/common/ItemsNotUpdated';
import HostelCard from '../../components/admin/home/HostelCard';
import HostelCardSkeleton from '../../components/admin/home/HostelCardSkeleton';

export default function Home() {
  const { hostels, loading, fetchHostels } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchHostels(); }, []);

  const filteredHostels = hostels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.id.toString().includes(searchTerm) ||
    h.residents.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Responsive padding and min-height
    <div className="min-h-screen max-w-400 mx-auto p-4 md:p-8 lg:p-10">
      
      {/* 1. Header with Searchbar */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-xl md:text-4xl font-bold text-gray-800">Hostel Directory</h1>
           {/* <p className="text-gray-500 text-sm">Overview of all hostels</p> */}
        </div>

        <div className="w-full md:w-96 relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search hostels..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid: 1 col on mobile, 2 on small tablets, 2/3 on large tablets, 3/4 on desktop */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <HostelCardSkeleton key={i} />)}
          </div>
        ) : filteredHostels.length === 0 ? (
          <ItemsNotUpdated heading="No Hostels Found" subheading="Try searching with a different name or hostel number." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredHostels.map((hostel) => <HostelCard key={hostel.id} hostel={hostel}/>)}
          </div>
        )}
      </div>
    </div>
  );
}