import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
      <div className="flex items-center gap-2 bg-[#2D2D2D] text-white px-4 py-2.5 rounded-full shadow-lg text-sm">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
