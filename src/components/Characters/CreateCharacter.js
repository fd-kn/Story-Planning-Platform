import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateCharacter = () => {
  const { id } = useParams(); // Story ID from the URL
  const navigate = useNavigate(); // To handle navigation
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [personality, setPersonality] = useState('');
  const [backstory, setBackstory] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false); // To track the image upload state

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Set upload state to true

    const timestamp = Date.now(); // Generate a unique filename using the current timestamp
    const uniqueFileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `characters/${id}/${uniqueFileName}`);

    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded file
      const imageUrl = await getDownloadURL(storageRef);
      console.log('Image uploaded successfully. URL:', imageUrl);

      // Set the image URL in the state
      setImage(imageUrl);
    } catch (error) {
      console.error("Error uploading the image:", error);
      alert("There was an error uploading the image. Please try again.");
    } finally {
      setUploading(false); // Set upload state back to false
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent form submission if the image is still uploading
    if (uploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    const characterData = {
      name: name || 'Unnamed Character',
      birthdate: birthdate || 'Unknown Birthdate',
      age: age || 'Unknown Age',
      height: height || 'Unknown Height',
      weight: weight || 'Unknown Weight',
      personality: personality || 'Undefined Personality',
      backstory: backstory || 'No Backstory Provided',
      notes: notes || 'No Additional Notes',
      image: image || null, // Handle optional image
    };

    try {
      // Add a new document with a generated ID to Firestore
      await addDoc(collection(db, 'stories', id, 'characters'), characterData);
      alert('Character created successfully!');
      navigate(`/story/${id}/characters`); // Navigate back to the character list after creation
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/story/${id}/characters`); // Navigate back to the character list without saving
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Create Character</h1>

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
          <label className="block text-gray-700">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Height</label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Weight</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Personality</label>
          <input
            type="text"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Backstory</label>
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Character Image</label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            disabled={uploading} // Disable submit button if uploading
          >
            {uploading ? 'Uploading...' : 'Create Character'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCharacter;
