import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

export function useSupabaseArray(table, userId, defaultVal) {
  const [val, setVal] = useState(defaultVal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data from Supabase
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          console.error(`Error loading ${table}:`, err);
          setError(err.message);
        } else if (data) {
          setVal(data);
        }
        setLoading(false);
      });
  }, [table, userId]);

  const setAndSync = useCallback(
    (updater) => {
      setVal((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (!userId) return next;

        // Determine what changed
        const prevItems = Array.isArray(prev) ? prev : [prev];
        const nextItems = Array.isArray(next) ? next : [next];

        // Use a stable key for comparison (id if available, else _tempKey or index)
        const keyOf = (item, idx) =>
          item.id != null ? item.id : item._tempKey ?? `__new_${idx}`;

        // Find added items (in next but not in prev)
        const added = nextItems.filter(
          (n, ni) => !prevItems.some((p, pi) => keyOf(p, pi) === keyOf(n, ni))
        );
        // Find removed items (in prev but not in next)
        const removed = prevItems.filter(
          (p, pi) => !nextItems.some((n, ni) => keyOf(n, ni) === keyOf(p, pi))
        );
        // Find updated items (in both but changed)
        const updated = nextItems.filter((n, ni) => {
          const prevItem = prevItems.find((p, pi) => keyOf(p, pi) === keyOf(n, ni));
          return prevItem && JSON.stringify(prevItem) !== JSON.stringify(n);
        });

        // Batch operations
        const ops = [];
        if (removed.length > 0) {
          const removable = removed.filter((r) => r.id != null);
          if (removable.length > 0) {
            ops.push(
              supabase
                .from(table)
                .delete()
                .in("id", removable.map((r) => r.id))
            );
          }
        }
        if (added.length > 0) {
          // Strip undefined id and _tempKey before insert so Supabase auto-generates the id
          const insertPayload = added.map((r) => {
            const { id, _tempKey, ...rest } = r;
            return id != null ? { id, ...rest, user_id: userId } : { ...rest, user_id: userId };
          });
          ops.push(
            supabase
              .from(table)
              .insert(insertPayload)
              .select()
          );
        }
        // Update each changed item individually
        updated.forEach((item) => {
          if (item.id == null) return; // skip items without an id
          ops.push(
            supabase
              .from(table)
              .update(item)
              .eq("id", item.id)
              .eq("user_id", userId)
          );
        });

        if (ops.length > 0) {
          Promise.all(ops).catch((err) => {
            console.error(`Error syncing ${table}:`, err);
            setError(err.message);
          });
        }

        return next;
      });
    },
    [table, userId]
  );

  return [val, setAndSync, { loading, error }];
}
