import React from "react";
import { TimeSlot } from "../hooks/useTimeSlots";
import { Clock, Users } from "lucide-react";

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  onSlotSelect: (slot: TimeSlot) => void;
}

const TimeSlotGrid = ({ timeSlots, onSlotSelect }: TimeSlotGridProps) => {
  const formatTime = (time: string) => {
    // Convert from 24-hour format (HH:MM:SS) to 12-hour format
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const getAvailabilityColor = (slot: TimeSlot) => {
    const spotsLeft = slot.max_capacity - slot.bookedCount;
    if (spotsLeft === 0)
      return "bg-gray-100 border-gray-300 cursor-not-allowed";
    if (spotsLeft === 1)
      return "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer";
    return "bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer";
  };

  const getAvailabilityText = (slot: TimeSlot) => {
    const spotsLeft = slot.max_capacity - slot.bookedCount;
    if (spotsLeft === 0) return "Full";
    if (spotsLeft === 1) return "1 spot left";
    return `${spotsLeft} spots available`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-6xl w-full px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Techyon Microgrants · Round 1 Interviews
          </h2>
          <p className="text-blue-600">
            If you're unable to make all available times, email us at{" "}
            <a
              href="mailto:microgrants@hackthenorth.com"
              className="underline hover:text-black"
            >
              microgrants@hackthenorth.com
            </a>
            .
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((slot) => {
            const spotsLeft = slot.max_capacity - slot.bookedCount;
            const isFull = spotsLeft === 0;

            return (
              <div
                key={slot.id}
                onClick={() => !isFull && onSlotSelect(slot)}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${getAvailabilityColor(
                  slot
                )}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {formatTime(slot.start_time)} -{" "}
                      {formatTime(slot.end_time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {slot.bookedCount}/{slot.max_capacity} booked
                    </span>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isFull
                        ? "bg-gray-200 text-gray-600"
                        : spotsLeft === 1
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {getAvailabilityText(slot)}
                  </div>
                </div>

                {!isFull && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Click to book this slot
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotGrid;
