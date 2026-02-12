function ExtraCard({ item, qty, onAdd, onRemove, delay }) {

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`
        bg-white rounded-2xl  shadow-sm hover:shadow-md p-5 flex justify-between items-center
      `}
    >
      <div>
        <p className="font-bold text-gray-700 text-lg leading-tight mb-1">{item.name}</p>
        <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md border border-green-100">
          ₹{item.unitPrice}
        </span>
      </div>

      {/* Controls Container */}
      <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
        <button
          onClick={onRemove}
          disabled={qty === 0}
          className="h-8 w-8 rounded-full bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:shadow-none transition-all flex items-center justify-center"
        >
          <i className="fa-solid fa-minus text-xs"></i>
        </button>
        
        <span className="w-8 text-center font-bold text-gray-800 tabular-nums">{qty}</span>
        
        <button
          onClick={onAdd}
          className="h-8 w-8 rounded-full bg-green-600 text-white shadow-sm shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition-all flex items-center justify-center"
        >
          <i className="fa-solid fa-plus text-xs"></i>
        </button>
      </div>
    </div>
  );
}

export default ExtraCard;