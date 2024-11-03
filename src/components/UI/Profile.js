import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { deleteUser, signOut } from 'firebase/auth';
import Modal from './Modal';
import LogOutButton from '../Auth/LogOutButton';
import { UserCircleIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteUsername, setDeleteUsername] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || '');
            setOriginalUsername(userData.username || '');
            setEditedUsername(userData.username || '');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to load user profile. Please try again.");
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
        setError("No user found. Please log in.");
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  const handleSaveProfile = async () => {
    if (!editedUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setModalContent({
      title: 'Confirm Save Changes',
      message: 'Are you sure you want to save changes?',
      onConfirm: async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { username: editedUsername.trim() }, { merge: true });
          setUsername(editedUsername.trim());
          setError('');
          setIsEditing(false);
          setOriginalUsername(editedUsername.trim());
          setIsModalOpen(false);
        } catch (err) {
          console.error('Error saving profile:', err);
          setError('Failed to save profile. Please try again.');
        }
      }
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEditedUsername(originalUsername);
    setIsEditing(false);
    setError('');
  };

  const handleDeleteAccount = async () => {
    if (deleteUsername.trim() !== originalUsername) {
      setError('Username does not match. Please enter your username to confirm.');
      return;
    }

    setModalContent({
      title: 'Confirm Account Deletion',
      message: 'Are you sure you want to delete your account? This action is irreversible.',
      onConfirm: async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await deleteDoc(userDocRef);

          const currentUser = auth.currentUser;
          if (currentUser) {
            await deleteUser(currentUser);
          }
        } catch (err) {
          console.error('Error deleting account:', err);
          setError('Failed to delete account. Please try again.');
        } finally {
          // Always log out and redirect to the landing page
          await signOut(auth);
          navigate('/'); // Redirect to the landing page
        }
      }
    });
    setIsModalOpen(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteUsername('');
    setError('');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user || !username) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200">
        <h2 className="text-2xl font-bold text-center">You need to finish setting up your profile!</h2>
        <p className="mt-4 text-center">Please set up your username and password.</p>
        <button
          onClick={() => navigate('/setup-username')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Go to Profile Setup
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>

      <div className="max-w-md mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-teal-600 hover:text-teal-800 transition duration-150 ease-in-out"
              >
                <ArrowLeftIcon className="h-8 w-10 mr-2" />
              </button>
              <UserCircleIcon className="h-12 w-12 text-pink-500" />
            </div>

            <h2 className="text-3xl font-extrabold text-pink-500 mb-6">Profile Page</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-4 flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-2">Username: </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your username"
                />
              ) : (
                <div className="flex items-center">
                  <p className="text-lg font-medium text-gray-900 mr-2">{username}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-teal-600 hover:text-teal-800 transition duration-150 ease-in-out"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 flex">
              <label className="block text-sm font-medium text-gray-700">Email: </label>
              <p className="text-lg font-medium text-gray-900 translate-x-2 -translate-y-1">{user.email}</p>
            </div>

            {isEditing && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Save Username
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-1" />
                Logout
              </button>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowDeleteConfirmation(!showDeleteConfirmation)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete Account
              </button>

              {showDeleteConfirmation && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type your username to confirm account deletion:
                  </label>
                  <input
                    type="text"
                    value={deleteUsername}
                    onChange={(e) => setDeleteUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your username"
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Confirm Delete Account
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-pink-500">Confirm Logout</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition duration-300"
          >
            Cancel
          </button>
          <LogOutButton
            onLogout={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-md hover:from-teal-500 hover:to-blue-600 transition duration-300"
          />
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 text-pink-500">{modalContent?.title}</h2>
        <p className="mb-6">{modalContent?.message}</p>
        <div className="flex justify-end">
          <button
            onClick={modalContent?.onConfirm}
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white py-2 px-4 rounded-md hover:from-teal-500 hover:to-blue-600 transition mr-2"
          >
            Confirm
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
