
import React, { useState } from 'react';
import LandingHero from '../components/LandingHero';
import TimeSlotGrid from '../components/TimeSlotGrid';
import BookingForm from '../components/BookingForm';
import ConfirmationPage from '../components/ConfirmationPage';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  bookedCount: number;
  maxCapacity: number;
  attendees: Attendee[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  resumeFile?: File;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'booking' | 'confirmation'>('landing');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ slot: TimeSlot; attendee: Attendee } | null>(null);
  
  // Generate time slots for Monday July 14, 6pm-11pm in 20-minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 18; // 6pm in 24h format
    const endHour = 23; // 11pm in 24h format
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 20) {
        const startTime = `${hour}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 20;
        const endTime = endMinute >= 60 
          ? `${hour + 1}:${(endMinute - 60).toString().padStart(2, '0')}`
          : `${hour}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          id: `slot-${hour}-${minute}`,
          startTime,
          endTime,
          bookedCount: Math.floor(Math.random() * 4), // Random demo data
          maxCapacity: 3,
          attendees: []
        });
      }
    }
    
    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.bookedCount < slot.maxCapacity) {
      setSelectedSlot(slot);
      setCurrentView('booking');
    }
  };

  const handleBookingSubmit = (attendeeData: { name: string; email: string; resumeFile?: File }) => {
    if (!selectedSlot) return;

    const newAttendee: Attendee = {
      id: `attendee-${Date.now()}`,
      ...attendeeData
    };

    const updatedSlots = timeSlots.map(slot => {
      if (slot.id === selectedSlot.id) {
        return {
          ...slot,
          bookedCount: slot.bookedCount + 1,
          attendees: [...slot.attendees, newAttendee]
        };
      }
      return slot;
    });

    setTimeSlots(updatedSlots);
    setConfirmedBooking({ 
      slot: updatedSlots.find(s => s.id === selectedSlot.id)!, 
      attendee: newAttendee 
    });
    setCurrentView('confirmation');
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
