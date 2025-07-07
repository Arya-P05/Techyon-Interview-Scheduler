
-- Create table for time slots
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL DEFAULT '2025-07-14',
  max_capacity INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bookings/interviewees
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  resume_file_name TEXT,
  resume_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the time slots for Monday July 14, 6pm-11pm
INSERT INTO public.time_slots (start_time, end_time) VALUES
  ('18:00', '18:20'),
  ('18:20', '18:40'),
  ('18:40', '19:00'),
  ('19:00', '19:20'),
  ('19:20', '19:40'),
  ('19:40', '20:00'),
  ('20:00', '20:20'),
  ('20:20', '20:40'),
  ('20:40', '21:00'),
  ('21:00', '21:20'),
  ('21:20', '21:40'),
  ('21:40', '22:00'),
  ('22:00', '22:20'),
  ('22:20', '22:40'),
  ('22:40', '23:00');

-- Enable Row Level Security (optional - since this is a public booking system)
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write access (since anyone can book)
CREATE POLICY "Anyone can view time slots" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
