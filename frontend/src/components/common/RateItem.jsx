/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useContext, useState } from 'react';
import StudentContext from '../../context/StudentContext';
import toast from 'react-hot-toast';
import { QUICK_TAGS_FOR_DIET, QUICK_TAGS_FOR_EXTRA } from '../../assets/assets';
import useModalA11y from '../../hooks/useModalA11y';
import { validateWithZod } from '../../utils/validateWithZod';
import { addRatingSchema } from '../../schemas/students.schema';
import PopupHeader from './PopupHeader';

function RateItem({ itemId, itemName, itemType, meal, onClose }) {
  useModalA11y(onClose);

  const { addRating } = useContext(StudentContext);

  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [errors, setErrors] = useState({});

  const [filteredTags, setFilteredTags] = useState([]);
  const [loadingRate, setLoadingRate] = useState(false);

  React.useEffect(() => {
    setTags([]);
    if (itemType === "diet") {
      setFilteredTags(QUICK_TAGS_FOR_DIET[rating-1]);
    } else {
      setFilteredTags(QUICK_TAGS_FOR_EXTRA[rating-1]);
    }
  }, [rating]);

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      if (tags.length >= 10) return;
      setTags([...tags, tag]);
    }
    setErrors((prev) => ({ ...prev, tags: "" }));
  };

  const handleSubmit = async () => {
    setLoadingRate(true);

    const { success, errors: validationErrors, data } = validateWithZod(addRatingSchema, {
      itemId,
      meal,
      rating,
      tags,
      suggestion,
    });

    if (!success) {
      setErrors(validationErrors);
      setLoadingRate(false);
      return;
    }

    setErrors({});

    try {
      await addRating(data);
      toast.success(`${itemName} rated successfully`);
      onClose();
    } catch (e) {
      toast.error(e.message || "Failed to submit rating");
    } finally {
      setLoadingRate(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6 transition-opacity animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-item-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <PopupHeader 
          heading={`Rate ${itemName} (${itemType === "diet" ? "Diet" : "Extra"})`}
          icon="ranking-star"
          color="green"
        />

        {/* Star Rating */}
        <div className="flex flex-col items-center bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2 font-medium">Would you like to have this item?</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Item rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} out of 5 stars`}
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
          {errors.tags && <p className="text-red-600 text-xs mt-1.5">{errors.tags}</p>}
        </div>

        {/* suggestion taking Input */}
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Give suggestion to improve</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={100}
              value={suggestion}
              onChange={(e) => {
                setSuggestion(e.target.value);
                if (errors.suggestion) setErrors((prev) => ({ ...prev, suggestion: "" }));
              }}
              placeholder="e.g., Add more spices, make it less oily"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
            <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400">
              {100 - suggestion.length}
            </span>
          </div>
        </div>
        {errors.suggestion && <p className="text-red-600 text-xs mt-1.5">{errors.suggestion}</p>}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loadingRate}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loadingRate}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRate ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Processing
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