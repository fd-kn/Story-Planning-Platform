import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreatePlot = () => {
  const { id } = useParams(); // Story ID from the URL
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false); // State to track image uploading
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Set upload state to true

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `plots/${id}/${uniqueFileName}`);

    try {
      // Upload the image to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Image uploaded and URL retrieved:', downloadURL);

      // Save the download URL to the component's state
      setImage(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image, please try again.');
    } finally {
      setUploading(false); // Reset upload state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      alert('Please wait for the image to finish uploading.');
      return;
    }

    const plotData = {
      title: title || 'Untitled Plot',
      description: description || 'No Description Provided',
      image: image || null, // Handle optional image
    };

    try {
      // Add a new document with a generated ID to Firestore
      await addDoc(collection(db, 'stories', id, 'plots'), plotData);
      alert('Plot created successfully!');
      navigate(`/story/${id}/plots`); // Navigate back to the plot list after creation
    } catch (error) {
      console.error('Error creating plot:', error);
      alert('Error creating plot, please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Create Plot</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <label className="block text-gray-700">Plot Image</label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          disabled={uploading} // Disable submit button if image is uploading
        >
          {uploading ? 'Uploading...' : 'Create Plot'}
        </button>
      </form>
    </div>
  );
};

export default CreatePlot;
