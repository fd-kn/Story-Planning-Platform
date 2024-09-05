import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { deleteObject, ref } from 'firebase/storage';

const LocationDetails = () => {
  const { id, locationId } = useParams(); // Story ID and Location ID from the URL
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchLocation = async () => {
      const locationRef = doc(db, `stories/${id}/locations`, locationId);
      const locationDoc = await getDoc(locationRef);
      if (locationDoc.exists()) {
        setLocation(locationDoc.data());
      } else {
        console.log('No such location!');
      }
      setLoading(false);
    };

    fetchLocation();
  }, [id, locationId]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this location?");

    if (!confirmDelete) {
      return; // Exit the function if the user cancels the deletion
    }

    const locationRef = doc(db, `stories/${id}/locations`, locationId);

    try {
      // Delete the image from Firebase Storage if it exists
      if (location?.image) {
        const imageRef = ref(storage, `locations/${id}/${location.image.split('/').pop()}`);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting location image:', error);
        }
      }

      // Delete the location document from Firestore
      await deleteDoc(locationRef);

      // Navigate back to the locations list after deletion
      navigate(`/story/${id}/locations`);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">{location?.name || 'Unnamed Location'}</h1>

      <div className="mt-4 flex gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded">
            Delete Location
          </button>
          <Link to={`/story/${id}/locations`} className="text-blue-500 underline">
            Back to Locations List
          </Link>
        </div>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <strong>Description:</strong> {location?.description || 'No Description Provided'}
        </div>
        {location?.image && (
          <div className="mb-4">
            <strong>Image:</strong>
            <img src={location.image} alt={location.name} className="w-full h-auto mt-4" />
          </div>
        )}
      </div>

      <Link to={`/story/${id}/locations`} className="mt-4 text-blue-500 underline">
        Back to Locations List
      </Link>
    </div>
  );
};

export default LocationDetails;
