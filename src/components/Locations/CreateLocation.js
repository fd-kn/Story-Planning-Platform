import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateLocation = () => {
  const { id } = useParams(); // Story ID from the URL
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false); // Track upload state
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Start upload process

    // Generate a unique filename using the current timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;
  
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `locations/${id}/${uniqueFileName}`);
  
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);
  
      // Get the download URL for the uploaded image
      const imageUrl = await getDownloadURL(storageRef);
      console.log('Image uploaded successfully. URL:', imageUrl);
  
      // Set the image URL in the state
      setImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("There was an error uploading the image. Please try again.");
    } finally {
      setUploading(false); // Finish upload process
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't allow submission if upload is in progress
    if (uploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    const locationData = {
      name: name || 'Unnamed Location',
      description: description || 'No Description Provided',
      image: image || null, // Handle optional image
    };

    try {
      // Create a new document with an auto-generated ID
      const locationRef = await addDoc(collection(db, 'stories', id, 'locations'), locationData);
      alert('Location created successfully!');
      navigate(`/story/${id}/locations`);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/story/${id}/locations`);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Create Location</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Location Image</label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          disabled={uploading} // Disable button while image is uploading
        >
          {uploading ? 'Uploading...' : 'Create Location'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateLocation;
