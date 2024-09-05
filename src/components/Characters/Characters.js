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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Characters</h1>

      {characters.length > 0 ? (
        <ul className="mb-8">
          {characters.map((character) => (
            <li key={character.id} className="mb-2">
              <Link
                to={`/story/${id}/characters/${character.id}`}
                className="text-blue-500 underline"
              >
                {character.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No characters yet.</p>
      )}

      <Link
        to={`/story/${id}/create-character`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Character
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Characters;
