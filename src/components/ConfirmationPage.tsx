
import React from 'react';
import { TimeSlot, Attendee } from '../pages/Index';
import { CheckCircle, Calendar, Clock, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationPageProps {
  booking: {
    slot: TimeSlot;
    attendee: Attendee;
  };
  onNewBooking: () => void;
}

const ConfirmationPage = ({ booking, onNewBooking }: ConfirmationPageProps) => {
  const { slot, attendee } = booking;

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Thank you, {attendee.name}! Your interview slot has been successfully booked.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-4">Interview Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Monday, July 14th</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">
                Group session with 2 other candidates
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">
                Confirmation sent to {attendee.email}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
          <ul className="text-green-800 text-sm space-y-1 text-left list-disc list-inside">
            <li>Check your email for the Zoom link and meeting details</li>
            <li>Add the interview to your calendar</li>
            <li>Prepare questions about the role and company</li>
            <li>Test your camera and microphone before the session</li>
            <li>Join the meeting 2-3 minutes early</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Important:</strong> If you need to cancel or reschedule, please contact us at least 2 hours before your scheduled time.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onNewBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Book Another Slot
          </Button>
          
          <p className="text-gray-500 text-sm">
            Need help? Contact us at support@company.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
