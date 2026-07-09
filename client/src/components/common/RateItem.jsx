/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react';
import StudentContext from '../../context/StudentContext';
import toast from 'react-hot-toast';
import { QUICK_TAGS_FOR_DIET, QUICK_TAGS_FOR_EXTRA } from '../../assets/assets';


function RateItem({ itemName, itemType, meal, onClose }) {
  const { addRating, loadingRate } = useContext(StudentContext);

  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  const [filteredTags, setFilteredTags] = useState([]);
  
  // update filtered tags and selected tags when rating changes
  React.useEffect(() => {
    setTags([]);

    if (itemType === "diet") {
      setFilteredTags(QUICK_TAGS_FOR_DIET[rating-1]);
    } else {
      setFilteredTags(QUICK_TAGS_FOR_EXTRA[rating-1]);
    }
  }, [rating]);

  // Handle tag selection and deselection
  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      if (tags.length >= 10) return;
      setTags([...tags, tag]);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    try{
      // clean up and validate suggestion
      setSuggestion(suggestion.trim().slice(0, 100));

      await addRating({itemName, itemType, meal, rating, tags, suggestion});
      toast.success(`${itemName} rated succesfully`)
      onClose();
    }catch(e){
      toast.error(e.message || "Failed to submit rating.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6 transition-opacity animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{String(itemName+" ( "+itemType+" )").toUpperCase()}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2 font-medium">Would you like to have this item?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-3xl transition-transform duration-100 active:scale-90 focus:outline-none"
                onClick={() => setRating(star)}
              >
                {rating >= star ? (
                  <i className="fa-solid fa-star text-amber-400 drop-shadow-sm"></i>
                ) : (
                  <i className="fa-regular fa-star text-gray-300"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Select Quick Tags</h3>
            <span className={`text-xs font-medium ${tags.length >= 10 ? 'text-red-500' : 'text-gray-400'}`}>
              {tags.length}/10 chosen
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {filteredTags.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  disabled={!isSelected && tags.length >= 10}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
                  }`}
                >
                  {tag} {isSelected && <i className="fa-solid fa-check ml-1 text-[10px]"></i>}
                </button>
              );
            })}
          </div>
        </div>

        {/* suggestion taking Input */}
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Give suggestion to improve</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={100}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="e.g., Add more spices, make it less oily"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
            <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400">
              {100 - suggestion.length}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loadingRate}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingRate ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default RateItem;