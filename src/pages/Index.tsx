
import React, { useState } from 'react';
import LandingHero from '../components/LandingHero';
import TimeSlotGrid from '../components/TimeSlotGrid';
import BookingForm from '../components/BookingForm';
import ConfirmationPage from '../components/ConfirmationPage';
import { useTimeSlots, TimeSlot, Attendee } from '../hooks/useTimeSlots';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'booking' | 'confirmation'>('landing');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ slot: TimeSlot; attendee: Attendee } | null>(null);
  
  const { timeSlots, isLoading, error, createBooking } = useTimeSlots();

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.bookedCount < slot.max_capacity) {
      setSelectedSlot(slot);
      setCurrentView('booking');
    }
  };

  const handleBookingSubmit = async (attendeeData: { name: string; email: string; resumeFile?: File }) => {
    if (!selectedSlot) return;

    try {
      console.log('Submitting booking...', attendeeData);
      
      const booking = await createBooking(selectedSlot.id, attendeeData);
      
      const newAttendee: Attendee = {
        id: booking.id,
        name: attendeeData.name,
        email: attendeeData.email,
        resumeFile: attendeeData.resumeFile
      };

      // Find the updated slot from the refetched data
      const updatedSlot = timeSlots.find(s => s.id === selectedSlot.id);
      
      setConfirmedBooking({ 
        slot: updatedSlot || selectedSlot, 
        attendee: newAttendee 
      });
      setCurrentView('confirmation');
      
      toast({
        title: "Booking Confirmed!",
        description: "Your interview slot has been successfully booked.",
      });
      
    } catch (err) {
      console.error('Booking failed:', err);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your slot. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToSlots = () => {
    setCurrentView('landing');
    setSelectedSlot(null);
  };

  const handleNewBooking = () => {
    setCurrentView('landing');
    setSelectedSlot(null);
    setConfirmedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available time slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Time Slots</h2>
            <p className="text-red-600 text-sm">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === 'landing' && (
        <div>
          <LandingHero />
          <TimeSlotGrid 
            timeSlots={timeSlots} 
            onSlotSelect={handleSlotSelect}
          />
        </div>
      )}
      
      {currentView === 'booking' && selectedSlot && (
        <BookingForm 
          slot={selectedSlot}
          onSubmit={handleBookingSubmit}
          onBack={handleBackToSlots}
        />
      )}
      
      {currentView === 'confirmation' && confirmedBooking && (
        <ConfirmationPage 
          booking={confirmedBooking}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
};

export default Index;
