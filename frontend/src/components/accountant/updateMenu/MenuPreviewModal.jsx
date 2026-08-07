import { DAYS,MEALS } from "../../../assets/assets";
import useModalA11y from "../../../hooks/useModalA11y";
import PopupHeader from "../../common/PopupHeader";

export default function MenuPreviewModal({ isOpen, onClose, onConfirm, menu, loading }){
  useModalA11y(onClose, isOpen);
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="pt-4 border-b border-b-gray-200 flex justify-center items-center">
          <PopupHeader 
            heading="Confirm Weekly Menu"
            subheading="Review the menu before publishing"
            icon="upload"
            color="green"
          />
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DAYS.map((day) => (
              <div key={day} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
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
        <div className="px-6 py-4 border-t border-t-gray-200 bg-white flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Processing
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};