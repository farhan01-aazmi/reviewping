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
        } else if (data?.length) {
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

        // Find added items (in next but not in prev)
        const added = nextItems.filter(
          (n) => !prevItems.find((p) => p.id === n.id)
        );
        // Find removed items (in prev but not in next)
        const removed = prevItems.filter(
          (p) => !nextItems.find((n) => n.id === p.id)
        );
        // Find updated items (in both but changed)
        const updated = nextItems.filter((n) => {
          const prevItem = prevItems.find((p) => p.id === n.id);
          return prevItem && JSON.stringify(prevItem) !== JSON.stringify(n);
        });

        // Batch operations
        const ops = [];
        if (removed.length > 0) {
          ops.push(
            supabase
              .from(table)
              .delete()
              .in("id", removed.map((r) => r.id))
          );
        }
        if (added.length > 0) {
          ops.push(
            supabase
              .from(table)
              .insert(added.map((r) => ({ ...r, user_id: userId })))
          );
        }
        // Update each changed item individually
        updated.forEach((item) => {
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
