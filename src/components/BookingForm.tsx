
import React, { useState } from 'react';
import { TimeSlot } from '../pages/Index';
import { ArrowLeft, Upload, User, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookingFormProps {
  slot: TimeSlot;
  onSubmit: (data: { name: string; email: string; resumeFile?: File }) => void;
  onBack: () => void;
}

const BookingForm = ({ slot, onSubmit, onBack }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resumeFile: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resumeFile: file }));
    }
  };

  const spotsLeft = slot.maxCapacity - slot.bookedCount;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Book Your Interview Slot</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Time Slot</h3>
          <p className="text-blue-800">
            Monday, July 14th • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="resume" className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4" />
              <span>Resume Upload</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label htmlFor="resume" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload your resume
                </span>
                <span className="text-gray-500 block text-sm mt-1">
                  PDF, DOC, or DOCX (max 5MB)
                </span>
              </label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.resumeFile && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ {formData.resumeFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">What to Expect:</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• You'll receive a confirmation email with the Zoom link</li>
              <li>• The session will include you and 2 other candidates</li>
              <li>• Come prepared to discuss your experience and ask questions</li>
              <li>• The format encourages collaborative discussion</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.name || !formData.email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isSubmitting ? 'Booking...' : 'Confirm My Booking'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
