-- Add social links to tenant_settings
ALTER TABLE public.tenant_settings 
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_tiktok text;

-- Add comment
COMMENT ON COLUMN public.tenant_settings.social_instagram IS 'Instagram profile URL';
COMMENT ON COLUMN public.tenant_settings.social_facebook IS 'Facebook page URL';
COMMENT ON COLUMN public.tenant_settings.social_tiktok IS 'TikTok profile URL';
