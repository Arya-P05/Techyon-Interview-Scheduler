import React, { useState } from "react";
import { TimeSlot } from "../hooks/useTimeSlots";
import { ArrowLeft, Upload, User, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFormProps {
  slot: TimeSlot;
  onSubmit: (data: { name: string; email: string }) => void;
  onBack: () => void;
}

const BookingForm = ({ slot, onSubmit, onBack }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (time: string) => {
    // Convert from 24-hour format (HH:MM:SS) to 12-hour format
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsLeft = slot.max_capacity - slot.bookedCount;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl w-full px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4 p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              Book Your Interview
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Selected Time Slot
            </h3>
            <p className="text-blue-800">
              Monday, July 14th • {formatTime(slot.start_time)} -{" "}
              {formatTime(slot.end_time)}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} remaining
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="name"
                className="flex items-center space-x-2 mb-2"
              >
                <User className="w-4 h-4" />
                <span>Full Name</span>
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="flex items-center space-x-2 mb-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isSubmitting ? "Booking..." : "Confirm My Booking"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
