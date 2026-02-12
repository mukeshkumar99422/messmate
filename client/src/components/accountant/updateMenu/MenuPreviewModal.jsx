import { DAYS,MEALS } from "../../../assets/assets";

export default function MenuPreviewModal({ isOpen, onClose, onConfirm, menu, loading }){
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Confirm Weekly Menu</h3>
            <p className="text-sm text-gray-500">Review the menu before publishing</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition">
            <i className="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DAYS.map((day) => (
              <div key={day} className="bg-white rounded-2xl p-5 border shadow-sm">
                <h4 className="text-lg font-bold capitalize text-green-700 mb-3 border-b pb-2">{day}</h4>
                <div className="space-y-4">
                  {MEALS.map((meal) => {
                    const data = menu[day]?.[meal];
                    if (!data?.diet?.length && !data?.extras?.length) return null;
                    return (
                      <div key={meal} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold capitalize text-gray-700">{meal}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            {data.time.start} - {data.time.end}
                          </span>
                        </div>
                        {/* Diet */}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {data.diet.map((d, i) => (
                            <span key={i} className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-xs font-medium">
                              {d.name}
                            </span>
                          ))}
                        </div>
                        {/* Extras */}
                        {data.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {data.extras.map((e, i) => (
                              <span key={i} className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-xs font-medium">
                                + {e.name} (₹{e.price})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
            Publish Menu
          </button>
        </div>
      </div>
    </div>
  );
};