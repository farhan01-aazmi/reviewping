-- ============================
-- Migration 026: Grant usage-counter RPCs to anon/authenticated
-- Frontend calls supabase.rpc("increment_ai_generations" / "increment_qr_scans")
-- from the browser (anon client). Previously only service_role had EXECUTE,
-- so every call silently failed and counters stayed 0.
-- Both RPCs are SECURITY DEFINER + insert-on-conflict, so this is safe.
-- ============================

GRANT EXECUTE ON FUNCTION public.increment_ai_generations(INTEGER, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_qr_scans(UUID) TO anon, authenticated;
