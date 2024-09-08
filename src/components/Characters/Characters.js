import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Characters = () => {
  const { id } = useParams(); // Story ID from the URL
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      const q = query(collection(db, `stories/${id}/characters`));
      const querySnapshot = await getDocs(q);
      const charactersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCharacters(charactersList);
      setLoading(false);
    };

    fetchCharacters();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Characters</h1>

        {characters.length > 0 ? (
          <ul className="space-y-4">
            {characters.map((character) => (
              <li key={character.id} className="p-4 bg-gray-50 rounded-lg shadow-md">
                <Link
                  to={`/story/${id}/characters/${character.id}`}
                  className="text-lg font-medium text-blue-600 hover:underline"
                >
                  {character.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg text-gray-600">No characters yet.</p>
        )}

        <div className="mt-10 flex justify-center space-x-4">
          <Link
            to={`/story/${id}/create-character`}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Create Character
          </Link>

          <Link
            to={`/story/${id}`}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
          >
            Back to Story Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Characters;
