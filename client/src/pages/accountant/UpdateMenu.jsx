/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState} from "react";
import AccountantContext from "../../context/AccountantContext";
import toast from "react-hot-toast";
import Header from "../../components/common/Header";
import MenuPreviewModal from "../../components/accountant/updateMenu/MenuPreviewModal";
import { DAYS,MEALS,DEFAULT_TIMES } from "../../assets/assets";
import DaySelector from "../../components/common/DaySelector";
import { formatDate } from "../../utils/helpers";


// Helper to generate empty menu structure
const generateEmptyMenu = () => {
  const menu = {};
  DAYS.forEach((day) => {
    menu[day] = {};
    MEALS.forEach((meal) => {
      menu[day][meal] = {
        time: { ...DEFAULT_TIMES[meal] },
        diet: [],
        extras: [],
      };
    });
  });
  return menu;
};



/* ---------------- PAGE ---------------- */

export default function UpdateMenu() {
  const { extractWeeklyMenuFromImage, uploadWeeklyMenu, lastUpdatedOn, fetchWeeklyMenu } = useContext(AccountantContext);

  const [activeDay, setActiveDay] = useState("monday");
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [menu, setMenu] = useState(generateEmptyMenu());
  const [image, setImage] = useState(null);

  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ---------- Helpers for Deep State Updates ---------- */

  const getActiveData = () => menu[activeDay][activeMeal];

  const updateTime = (field, value) => {
    setMenu((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [activeMeal]: {
          ...prev[activeDay][activeMeal],
          time: { ...prev[activeDay][activeMeal].time, [field]: value },
        },
      },
    }));
  };

  const updateDiet = (idx, value) => {
    setMenu((prev) => {
      const newDiet = [...prev[activeDay][activeMeal].diet];
      newDiet[idx] = { name: value };
      return {
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          [activeMeal]: { ...prev[activeDay][activeMeal], diet: newDiet },
        },
      };
    });
  };

  const addDiet = () => {
    setMenu((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [activeMeal]: {
          ...prev[activeDay][activeMeal],
          diet: [...prev[activeDay][activeMeal].diet, { name: "" }],
        },
      },
    }));
  };

  const removeDiet = (idx) => {
    setMenu((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [activeMeal]: {
          ...prev[activeDay][activeMeal],
          diet: prev[activeDay][activeMeal].diet.filter((_, i) => i !== idx),
        },
      },
    }));
  };

  const updateExtra = (idx, field, value) => {
    setMenu((prev) => {
      const newExtras = [...prev[activeDay][activeMeal].extras];
      newExtras[idx] = { ...newExtras[idx], [field]: value };
      return {
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          [activeMeal]: { ...prev[activeDay][activeMeal], extras: newExtras },
        },
      };
    });
  };

  const addExtra = () => {
    setMenu((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [activeMeal]: {
          ...prev[activeDay][activeMeal],
          extras: [...prev[activeDay][activeMeal].extras, { name: "", price: "" }],
        },
      },
    }));
  };

  const removeExtra = (idx) => {
    setMenu((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [activeMeal]: {
          ...prev[activeDay][activeMeal],
          extras: prev[activeDay][activeMeal].extras.filter((_, i) => i !== idx),
        },
      },
    }));
  };

  /* ---------- Logic ---------- */

  const handleExtract = async () => {
    if (!image) return toast.error("Please upload an image first");
    setExtracting(true);
    try {
      const data = await extractWeeklyMenuFromImage(image);
      
      // Merge retrieved data with default structure to prevent crash on missing fields
      const mergedMenu = generateEmptyMenu();
      Object.keys(data).forEach(day => {
        if(mergedMenu[day]) {
            Object.keys(data[day]).forEach(meal => {
                if(mergedMenu[day][meal]) {
                    mergedMenu[day][meal] = {
                        ...mergedMenu[day][meal],
                        ...data[day][meal]
                    }
                }
            })
        }
      });

      setMenu(mergedMenu);
      toast.success("Menu extracted & filled successfully");
    } catch (e) {
      toast.error(e.message || "Failed to extract menu");
    } finally {
      setExtracting(false);
    }
  };

  const handleInitiateUpload = () => {
    // Basic Validation: Ensure at least one item exists in the whole week
    const hasItems = Object.values(menu).some((day) =>
      Object.values(day).some((meal) => meal.diet.length > 0)
    );

    if (!hasItems) {
      return toast.error("Menu is completely empty. Add some items.");
    }
    setShowModal(true);
  };

  const handleFinalUpload = async () => {
    setUploading(true);
    try {
      // Cleaning Data: Remove empty strings
      const cleanMenu = JSON.parse(JSON.stringify(menu)); // Deep clone
      
      for (const day of DAYS) {
        for (const meal of MEALS) {
            const mData = cleanMenu[day][meal];
            mData.diet = mData.diet.filter(d => d.name.trim() !== "");
            mData.extras = mData.extras.filter(e => e.name.trim() !== "" && e.price);
        }
      }

      await uploadWeeklyMenu(cleanMenu);
      toast.success("Weekly menu updated successfully!");
      setShowModal(false);
    } catch (e) {
      toast.error(e.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  //fetching the last update date via feth weekly menu
  useEffect(()=>{
    fetchWeeklyMenu();
  },[])


  /* ---------------- RENDER ---------------- */
  const activeData = getActiveData();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-24 px-4 md:px-8">
      
      <MenuPreviewModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onConfirm={handleFinalUpload} 
        menu={menu}
        loading={uploading}
      />

      <Header heading="Update Full Menu" subheading={
        lastUpdatedOn ? <p>Menu last updated on<span className="ml-1 text-gray-700">{formatDate(lastUpdatedOn)}</span></p> : "You are uploading the menu first time"
      } />

      {/* ---------- 1. IMAGE UPLOAD CARD ---------- */}
      <div className="max-w-7xl mx-auto mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col gap-2 w-full md:w-auto">
            <h3 className="font-bold text-gray-800">Auto-fill via Image</h3>
            <div className="flex items-center gap-4">
            <label className=" flex items-center gap-3 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition w-full md:w-auto">
                <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
                <span className="text-sm font-medium text-gray-600 truncate max-w-30 sm:max-w-50">
                    {image ? image.name : "Choose Menu Image"}
                </span>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="hidden" />
            </label>
            {image && (
                <img src={URL.createObjectURL(image)} alt="preview" className="h-12 w-12 rounded-lg object-cover border shadow-sm" />
            )}
            </div>
        </div>

        <button
          onClick={handleExtract}
          disabled={extracting}
          className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
        >
          {extracting ? (
             <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Processing AI...</>
          ) : (
             <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Extract & Autofill</>
          )}
        </button>
      </div>

      {/* ---------- 2. DAY SELECTOR ---------- */}
      <DaySelector onClickHandler={setActiveDay} activeDay={activeDay}/>

      {/* ---------- 3. MAIN EDITOR CARD ---------- */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        
        {/* Meal Tabs within Card */}
        <div className="flex border-b border-b-gray-200 bg-gray-50/50">
            {MEALS.map((meal) => (
                <button
                    key={meal}
                    onClick={() => setActiveMeal(meal)}
                    className={`flex-1 py-4 font-bold text-sm md:text-base capitalize border-b-2  transition-colors
                        ${activeMeal === meal 
                            ? "border-green-500 text-green-700 bg-white" 
                            : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    {meal}
                </button>
            ))}
        </div>

        <div className="p-4 md:p-8 space-y-8 md:space-y-10">

          {/* SECTION: TIME */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <i className="fa-regular fa-clock text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Serving Time</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Start</label>
                <input
                  type="time"
                  value={activeData.time.start}
                  onChange={(e) => updateTime("start", e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-gray-700"
                />
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">End</label>
                <input
                  type="time"
                  value={activeData.time.end}
                  onChange={(e) => updateTime("end", e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* SECTION: DIET */}
          <div>
             <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-list-ul text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Menu Items</h3>
            </div>

            <div className="space-y-3">
              {activeData.diet.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="text-gray-300 font-bold text-sm w-4 text-center shrink-0">{i + 1}.</span>
                  <input
                    value={item.name}
                    onChange={(e) => updateDiet(i, e.target.value)}
                    placeholder={`Item name (eg: ${activeMeal=="breakfast" ? "Masala Dosa" : (activeMeal=="lunch" ? "Curd" : "Rice")})`}
                    className="flex-1 min-w-0 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-400 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                  />
                  <button
                    onClick={() => removeDiet(i)}
                    className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={addDiet}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Add Item
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* SECTION: EXTRAS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-plus text-sm"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Extras / Add-ons</h3>
            </div>

            <div className="space-y-3">
              {activeData.extras.map((extra, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl border border-gray-100 sm:border-0">
                   <div className="flex-1 flex gap-3">
                      <input
                        value={extra.name}
                        onChange={(e) => updateExtra(i, "name", e.target.value)}
                        placeholder={`Item name (eg: ${activeMeal=="breakfast" ? "Banana" : (activeMeal=="lunch" ? "Icecream" : "Milk")})`}
                        className="flex-1 w-full bg-white sm:bg-gray-50 border border-gray-200 sm:border-transparent focus:border-purple-400 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                      />
                   </div>
                   <div className="flex gap-3">
                        <div className="relative flex-1 sm:flex-none sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={extra.price}
                                onChange={(e) => updateExtra(i, "price", e.target.value)}
                                placeholder="Price"
                                className="w-full bg-white sm:bg-gray-50 border border-gray-200 sm:border-transparent focus:border-purple-400 rounded-xl pl-7 pr-4 py-3 outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                        <button
                            onClick={() => removeExtra(i)}
                            className="h-11 sm:h-auto w-12 sm:w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                   </div>
                </div>
              ))}
              <button
                onClick={addExtra}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Add Extra
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t border-t-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <span className="text-xs text-gray-400 font-medium text-center md:text-left">
              Ensure all days are filled correctly before saving.
            </span>
          <button
            onClick={handleInitiateUpload}
            className="w-full md:w-auto px-10 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Review & Save Menu <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}