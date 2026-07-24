import { useEffect } from "react";

export default function useModalA11y(onClose, isOpen = true) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, isOpen]);
}