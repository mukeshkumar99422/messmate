import { assets } from '../../assets/assets';

function ItemsNotUpdated({heading="Items Not Found", subheading="Items Not Found."}) {
  return (
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-dashed border-gray-300 py-20 flex flex-col items-center text-center">
        {/* <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <i className="fa-solid fa-calendar-xmark text-gray-400 text-2xl"></i>
        </div> */}
        <img src={assets.itemsNotUpdated} alt="No data" className="mx-auto mb-4 w-35 h-45" />
        <h3 className="text-lg font-bold text-gray-800">
          {heading}
        </h3>
        <p className="text-center text-gray-500 text-sm mt-1">
          {subheading}
        </p>
      </div>
    );
}

export default ItemsNotUpdated