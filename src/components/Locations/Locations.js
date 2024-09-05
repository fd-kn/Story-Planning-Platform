import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Locations = () => {
  const { id } = useParams(); // Story ID from the URL
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const q = query(collection(db, `stories/${id}/locations`));
      const querySnapshot = await getDocs(q);
      const locationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locationsList);
      setLoading(false);
    };

    fetchLocations();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Locations</h1>

      {locations.length > 0 ? (
        <ul className="mb-8">
          {locations.map((location) => (
            <li key={location.id} className="mb-2">
              <Link
                to={`/story/${id}/locations/${location.id}`}
                className="text-blue-500 underline"
              >
                {location.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No locations yet.</p>
      )}

      <Link
        to={`/story/${id}/create-location`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Location
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Locations;
