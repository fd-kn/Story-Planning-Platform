import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateGalleryItem = () => {
  const { id } = useParams(); // Story ID from the URL
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false); // State to track image uploading
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Set upload state to true

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `gallery/${id}/${uniqueFileName}`);

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

    const galleryItemData = {
      caption: caption || 'No Caption',
      image: image || null, // Handle optional image
    };

    try {
      // Add a new document with a generated ID to Firestore
      await addDoc(collection(db, 'stories', id, 'gallery'), galleryItemData);
      alert('Gallery item created successfully!');
      navigate(`/story/${id}/gallery`); // Navigate back to the gallery list after creation
    } catch (error) {
      console.error('Error creating gallery item:', error);
      alert('Error creating gallery item, please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Create Gallery Item</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-gray-700">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image</label>
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
          {uploading ? 'Uploading...' : 'Create Gallery Item'}
        </button>
      </form>
    </div>
  );
};

export default CreateGalleryItem;
