import { Link } from 'react-router-dom';

export default function HostelCard({ hostel }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-200 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300">
      
      {/* Card Header Area */}
      <div className="p-5 md:p-6 pb-4">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-800 truncate">
          {hostel.name}
        </h3>
        <p className="text-[10px] md:text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Hostel NO: {hostel.id}
        </p>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
          {/* Gender Tag */}
          <span className={`py-2 md:py-3 px-3 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-2 uppercase tracking-tight w-fit ${
            hostel.residents === 'boys' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
          }`}>
            <i className={`fa-solid ${hostel.residents === 'boys' ? 'fa-mars' : 'fa-venus'}`}></i>
            {hostel.residents}
          </span>

          {/* Student Count Tag */}
          <div className="flex items-center gap-2 py-2 md:py-3 px-3 bg-gray-50 rounded-xl w-fit">
            <i className="fa-solid fa-users-viewfinder text-orange-500 text-[10px] md:text-sm"></i>
            <span className="text-[11px] md:text-sm font-bold text-gray-700 whitespace-nowrap">
              {hostel.students} <span className="text-gray-400 font-medium ml-1">Students</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-auto px-5 md:px-6 pb-5 md:pb-6">
        <div className="h-px bg-gray-100 w-full mb-4"></div>
        <Link 
          to={`/admin/hostel/${hostel.id}`} 
          className="group flex items-center justify-center gap-2 text-[11px] md:text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
        >
          See More Details
          <i className="fa-solid fa-arrow-right-long text-[10px] md:text-xs group-hover:translate-x-1 transition-transform"></i>
        </Link>
      </div>

    </div>
  );
}