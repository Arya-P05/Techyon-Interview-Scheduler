
import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';

const LandingHero = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GroupSlot Scheduler
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your spot in our innovative group interview format. Join 2 other candidates in a 20-minute breakout room session.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Group Format</h3>
            <p className="text-gray-600 text-sm">
              Each session includes exactly 3 candidates for dynamic group interaction
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">20 Minutes</h3>
            <p className="text-gray-600 text-sm">
              Focused, efficient sessions designed for meaningful conversation
            </p>
          </div>

          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Monday July 14</h3>
            <p className="text-gray-600 text-sm">
              Available slots from 6:00 PM to 11:00 PM
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How It Works:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Choose an available time slot below</li>
            <li>Complete the booking form with your details</li>
            <li>Upload your resume for review</li>
            <li>Receive confirmation with Zoom link</li>
            <li>Join your group session at the scheduled time</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
