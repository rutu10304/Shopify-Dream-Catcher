-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create custom orders table
CREATE TABLE public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_image TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin messages table for custom order chats
CREATE TABLE public.custom_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.custom_orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_order_messages ENABLE ROW LEVEL SECURITY;

-- Testimonials policies (public read, admin write)
CREATE POLICY "Anyone can view testimonials"
ON public.testimonials
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Custom orders policies
CREATE POLICY "Users can view their own orders"
ON public.custom_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own orders"
ON public.custom_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
ON public.custom_orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Custom order messages policies
CREATE POLICY "Users can view messages for their orders"
ON public.custom_order_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_orders
    WHERE id = order_id
    AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can send messages for their orders"
ON public.custom_order_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.custom_orders
    WHERE id = order_id
    AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Create storage bucket for custom order images
INSERT INTO storage.buckets (id, name, public) VALUES ('custom-orders', 'custom-orders', true);

-- Storage policies for custom orders
CREATE POLICY "Anyone can view custom order images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'custom-orders');

CREATE POLICY "Authenticated users can upload custom order images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'custom-orders');

-- Add trigger for updated_at
CREATE TRIGGER update_custom_orders_updated_at
BEFORE UPDATE ON public.custom_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_order_messages;