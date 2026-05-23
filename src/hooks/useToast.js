import { useCallback } from "react";
import { toast as sonner } from "sonner";

export function useToast() {
  const toast = useCallback((message, type) => {
    if (type === "error") {
      sonner.error(message);
    } else if (type === "info") {
      sonner.info(message);
    } else {
      sonner.success(message);
    }
  }, []);
  return { toast, toasts: [] };
}
