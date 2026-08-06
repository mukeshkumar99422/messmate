/* eslint-disable react-hooks/set-state-in-effect */
// by default for students removal
import { useState, useEffect } from "react";
import useModalA11y from "../../hooks/useModalA11y";
import {otpConfirmationSchema} from "../../schemas/common";
import { validateWithZod } from "../../utils/validateWithZod";

export default function ConfirmOtpModal({
  isOpen,

  onClose,
  onConfirm,
  onResend,

  title,
  description,
  confirmLabel,

  loading,
  resending,
}) {
  useModalA11y(onClose, isOpen);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  // effects
  useEffect(() => {
    if (!isOpen) return;
    setOtp("");
    setError("");
    setTimer(30);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  // handlers
  const handleSubmit = () => {
    const {success, errors, data} = validateWithZod(otpConfirmationSchema, {otp});
    if (!success) {
      setError(errors.otp);
      return;
    }

    setError("");
    onConfirm(data.otp);
  };

  const handleResend = async () => {
    setOtp("");
    setError("");
    await onResend();
    setTimer(30);
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="text-center mb-6">
          <div className="h-14 w-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">
            {description}
          </p>
        </div>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ""));
            if (error) setError("");
          }}
          placeholder="6-digit OTP"
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-widest font-bold text-lg mb-1
            ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
        />
        {error && <p className="text-red-500 text-xs ml-1 font-medium mb-2">{error}</p>}

        <div className="flex justify-between items-center text-xs font-medium mb-6 mt-2">
          <span className="text-gray-400">Didn't get the code?</span>
          {timer > 0 ? (
            <span className="text-gray-400">Resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-red-600 hover:underline font-semibold disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Removing
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}