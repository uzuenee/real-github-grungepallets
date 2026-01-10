-- Fix the handle_new_user trigger to copy metadata from auth signup
-- Run this in your Supabase SQL Editor

-- First, update the function to use the metadata from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        company_name,
        contact_name,
        phone,
        address,
        city,
        state,
        zip
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'contact_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', ''),
        COALESCE(NEW.raw_user_meta_data->>'state', ''),
        COALESCE(NEW.raw_user_meta_data->>'zip', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also populate any existing empty profiles from auth.users metadata
-- This helps fix users who already signed up before the trigger was fixed
UPDATE profiles p
SET 
    company_name = COALESCE(NULLIF(p.company_name, ''), u.raw_user_meta_data->>'company_name', ''),
    contact_name = COALESCE(NULLIF(p.contact_name, ''), u.raw_user_meta_data->>'contact_name', '')
FROM auth.users u
WHERE p.id = u.id
AND (p.company_name = '' OR p.company_name IS NULL)
AND (u.raw_user_meta_data->>'company_name' IS NOT NULL OR u.raw_user_meta_data->>'contact_name' IS NOT NULL);
