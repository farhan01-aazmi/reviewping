import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(
      () => setToasts((p) => p.filter((t) => t.id !== id)),
      3500
    );
  }, []);

  return { toasts, toast };
}
