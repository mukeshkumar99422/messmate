function ConfirmModal({ total, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <i className="fa-solid fa-receipt"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Purchase</h3>
            <p className="text-gray-500 text-sm">
            Are you sure you want to add these items to your bill? This cannot be undone.
            </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-3xl font-extrabold text-gray-800">₹{total}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
                <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Processing
                </>
            ) : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;