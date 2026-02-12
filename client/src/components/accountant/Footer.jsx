function Footer() {
  return (
    <footer className="bg-gray-200 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">MessMate</span>. All rights reserved.
    </footer>
  )
}

export default Footer