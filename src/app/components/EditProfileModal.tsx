import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { X, Save, Loader2, Camera, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Populate form when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setStudentId(user.studentId || '');
      setCourse(user.course || '');
      setLevel(user.level || '');
      setProfilePicture(user.profilePicture || '');
      setError('');
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    const updates: any = { profilePicture };
    if (user?.role === 'lecturer') {
      updates.name = name;
    }
    updates.email = email;
    if (user?.role === 'student') {
      updates.course = course;
      updates.level = level;
    }

    const result = await updateProfile(updates);

    if (result.success) {
      toast.success('Profile updated successfully!');
      onClose();
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <UserIcon className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-xs font-medium">Change</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProfilePicture(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name {user?.role === 'lecturer' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={user?.role === 'student'}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent ${user?.role === 'student' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="Enter your full name"
            />
            {user?.role === 'student' && (
              <p className="text-xs text-gray-400 mt-1">Contact an administrator to change your name</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {user?.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="e.g., BC/GRD/22/118"
                />
                <p className="text-xs text-gray-400 mt-1">Contact an administrator to change your Student ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programme
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                  placeholder="e.g., Graphic Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                  placeholder="e.g., Level 400"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
