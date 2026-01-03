
import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { User, Phone, FileText, MapPin } from 'lucide-react';

interface ProfileProps {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <User className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Business Information</h3>
          <p className="text-sm text-gray-500 mb-6">Edit the details about your establishment.</p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="mt-2 text-gray-400"><User className="w-5 h-5" /></div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Owner Name</label>
                <input 
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50" 
                />
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-2 text-gray-400"><Phone className="w-5 h-5" /></div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Owner Number</label>
                <input 
                  value={formData.ownerNumber}
                  onChange={e => setFormData({ ...formData, ownerNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50" 
                />
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-2 text-gray-400"><FileText className="w-5 h-5" /></div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">FSSAI License No.</label>
                <input 
                  value={formData.fssai}
                  onChange={e => setFormData({ ...formData, fssai: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50" 
                />
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-2 text-gray-400"><MapPin className="w-5 h-5" /></div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cafe Address</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95">
            Save Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
