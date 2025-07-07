
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  date: string;
  max_capacity: number;
  bookedCount: number;
  attendees: Attendee[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  resumeFile?: File;
}

export const useTimeSlots = () => {
  const { data: timeSlots = [], isLoading, error, refetch } = useQuery({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      console.log('Fetching time slots from Supabase...');
      
      // Fetch time slots with booking counts
      const { data: slots, error: slotsError } = await supabase
        .from('time_slots')
        .select(`
          *,
          bookings (
            id,
            name,
            email,
            resume_file_name,
            resume_file_url
          )
        `)
        .order('start_time');

      if (slotsError) {
        console.error('Error fetching time slots:', slotsError);
        throw slotsError;
      }

      console.log('Raw slots data:', slots);

      // Transform the data to match our interface
      const transformedSlots: TimeSlot[] = slots.map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        date: slot.date,
        max_capacity: slot.max_capacity,
        bookedCount: slot.bookings?.length || 0,
        attendees: slot.bookings?.map((booking: any) => ({
          id: booking.id,
          name: booking.name,
          email: booking.email,
          resumeFileName: booking.resume_file_name,
          resumeFileUrl: booking.resume_file_url
        })) || []
      }));

      console.log('Transformed slots:', transformedSlots);
      return transformedSlots;
    }
  });

  const createBooking = async (slotId: string, attendeeData: { name: string; email: string; resumeFile?: File }) => {
    console.log('Creating booking for slot:', slotId, attendeeData);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        time_slot_id: slotId,
        name: attendeeData.name,
        email: attendeeData.email,
        resume_file_name: attendeeData.resumeFile?.name || null,
        // Note: For file upload, we'd need to implement Supabase Storage
        resume_file_url: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    console.log('Booking created:', data);
    
    // Refetch time slots to update the UI
    await refetch();
    
    return data;
  };

  return {
    timeSlots,
    isLoading,
    error,
    createBooking,
    refetch
  };
};
