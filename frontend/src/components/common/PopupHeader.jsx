import React from 'react'

function PopupHeader({heading, subheading, icon, color}) {
  return (
    <div>
      {/* <div className="text-center mb-2">
        <div className={`h-14 w-14 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center mx-auto text-xl mb-1`}>
            <i className={`fa-solid fa-${icon}`}></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{heading}</h3>
        {subheading && <p className="text-sm text-gray-500">{subheading}</p>}
      </div> */}
      <div className="text-center mb-2">
          {icon && <div className={`h-14 w-14 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl`}>
            <i className={`fa-solid fa-${icon}`}></i>
          </div>}
          <h3 className="text-xl font-bold text-gray-800">{heading}</h3>
          {subheading && <p className="text-gray-500 text-sm">
            {subheading}
          </p>}
        </div>
    </div>
  )
}

export default PopupHeader