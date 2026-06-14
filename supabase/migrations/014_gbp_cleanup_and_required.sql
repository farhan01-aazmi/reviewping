-- ============================================================
-- 014_gbp_cleanup_and_required.sql
-- Clean stale GBP connections + add GBP requirement at login
-- ============================================================

-- 1. Delete all stale/expired GBP connections
DELETE FROM gbp_connections 
WHERE is_connected = true 
  AND (token_expires_at < now() OR access_token IS NULL OR access_token = '');

-- 2. Also clean orphaned oauth states
DELETE FROM gbp_oauth_states 
WHERE expires_at < now();

-- 3. Create a view to check if user has valid GBP connection
-- Note: We query gbp_connections directly instead of joining auth.users
-- since we can't directly query auth.users from public schema
CREATE OR REPLACE VIEW user_gbp_status AS
SELECT 
  gc.user_id,
  gc.gbp_location_name,
  gc.gbp_location_id,
  gc.token_expires_at,
  CASE 
    WHEN gc.is_connected = true 
         AND gc.token_expires_at > now() 
         AND gc.access_token IS NOT NULL 
         AND gc.access_token != '' 
    THEN true 
    ELSE false 
  END as has_valid_gbp
FROM gbp_connections gc
WHERE gc.is_connected = true;

-- 5. Add RLS policy for the view
ALTER VIEW user_gbp_status OWNER TO postgres;
GRANT SELECT ON user_gbp_status TO authenticated;

-- 6. Function to check if user has valid GBP (for middleware/API use)
CREATE OR REPLACE FUNCTION public.user_has_valid_gbp(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM gbp_connections 
    WHERE user_id = user_uuid 
      AND is_connected = true 
      AND token_expires_at > now() 
      AND access_token IS NOT NULL 
      AND access_token != ''
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_has_valid_gbp(uuid) TO authenticated;
