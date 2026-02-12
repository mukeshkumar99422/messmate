function Header({heading, subheading}) {
  return (
    <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
          {heading}
        </h1>
        <p className="text-gray-500 font-medium text-base md:text-lg">
          {subheading}
        </p>
      </div>
  )
}

export default Header