import { useState } from "react";
import TimeSlotGrid from "../components/TimeSlotGrid";
import BookingForm from "../components/BookingForm";
import ConfirmationPage from "../components/ConfirmationPage";
import { useTimeSlots, TimeSlot, Attendee } from "../hooks/useTimeSlots";
import { toast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";

// Helper to format 24-hour time string (e.g., '18:00:00') to 12-hour (e.g., '6:00 PM')
function formatTo12Hour(timeStr: string) {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<
    "landing" | "booking" | "confirmation"
  >("landing");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    slot: TimeSlot;
    attendee: Attendee;
  } | null>(null);

  const { timeSlots, isLoading, error, createBooking } = useTimeSlots();

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.bookedCount < slot.max_capacity) {
      setSelectedSlot(slot);
      setCurrentView("booking");
    }
  };

  const handleBookingSubmit = async (attendeeData: {
    name: string;
    email: string;
  }) => {
    if (!selectedSlot) return;

    try {
      console.log("Submitting booking...", attendeeData);

      const booking = await createBooking(selectedSlot.id, attendeeData);

      const newAttendee: Attendee = {
        id: booking.id,
        name: attendeeData.name,
        email: attendeeData.email,
      };

      // Send confirmation email via EmailJS
      try {
        await emailjs.send("service_9q7qa88", "template_t7qs0dr", {
          to_name: attendeeData.name.split(" ")[0],
          interview_start: formatTo12Hour(booking.slot_start_time?.slice(0, 5)),
          interview_end: formatTo12Hour(booking.slot_end_time?.slice(0, 5)),
          to_email: attendeeData.email,
        });
      } catch (emailErr) {
        toast({
          title: "Email Not Sent",
          description:
            "Your booking was successful, but we could not send a confirmation email. Please contact microgrants@hackthenorth.com.",
          variant: "destructive",
        });
      }

      // Find the updated slot from the refetched data
      const updatedSlot = timeSlots.find((s) => s.id === selectedSlot.id);

      setConfirmedBooking({
        slot: updatedSlot || selectedSlot,
        attendee: newAttendee,
      });
      setCurrentView("confirmation");

      toast({
        title: "Booking Confirmed!",
        description: "Your interview slot has been successfully booked.",
      });
    } catch (err: any) {
      console.error("Booking failed:", err);
      if (err.message && err.message.includes("already booked a slot")) {
        toast({
          title: "Duplicate Booking",
          description:
            "You have already booked a slot with this email. If you need to change your slot, please contact microgrants@hackthenorth.com.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Failed",
          description:
            "There was an error booking your slot. Please try again. If the error persists, please contact microgrants@hackthenorth.com.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBackToSlots = () => {
    setCurrentView("landing");
    setSelectedSlot(null);
  };

  const handleNewBooking = () => {
    setCurrentView("landing");
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
            <h2 className="text-red-800 font-semibold mb-2">
              Error Loading Time Slots
            </h2>
            <p className="text-red-600 text-sm">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === "landing" && (
        <div>
          <TimeSlotGrid timeSlots={timeSlots} onSlotSelect={handleSlotSelect} />
        </div>
      )}

      {currentView === "booking" && selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          onSubmit={handleBookingSubmit}
          onBack={handleBackToSlots}
        />
      )}

      {currentView === "confirmation" && confirmedBooking && (
        <ConfirmationPage
          booking={confirmedBooking}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
};

export default Index;
