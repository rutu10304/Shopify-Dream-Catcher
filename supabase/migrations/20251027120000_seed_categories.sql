-- Seed default categories
-- Run this in the Supabase SQL editor to ensure these categories exist.

INSERT INTO public.categories (name, slug, description, image, display_order, is_active)
VALUES
  ('Car Hanging', 'car-hanging', 'Handmade car hanging dreamcatchers and charms', '', 1, true),
  ('Wall Hanging', 'wall-hanging', 'Decorative wall hangings and macrame pieces', '', 2, true),
  ('Keychain', 'keychain', 'Small dreamcatchers and charms for keys', '', 3, true),
  ('Rakhi', 'rakhi', 'Rakhi designs and festive keepsakes', '', 4, true),
  ('Photo Frame', 'photo-frame', 'Decorative photo frames and memory pieces', '', 5, true)
ON CONFLICT (slug) DO NOTHING;
