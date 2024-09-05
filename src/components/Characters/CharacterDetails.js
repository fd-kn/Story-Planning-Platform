import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { deleteObject, ref } from 'firebase/storage';

const CharacterDetails = () => {
  const { id, characterId } = useParams(); // Story ID and Character ID from the URL
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCharacter = async () => {
      const characterRef = doc(db, `stories/${id}/characters`, characterId);
      const characterDoc = await getDoc(characterRef);
      if (characterDoc.exists()) {
        setCharacter(characterDoc.data());
      } else {
        console.log('No such character!');
      }
      setLoading(false);
    };

    fetchCharacter();
  }, [id, characterId]);



  const handleDelete = async () => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this character?");
  
    if (!confirmDelete) {
      return; // Exit the function if the user cancels the deletion
    }
  
    const characterRef = doc(db, `stories/${id}/characters`, characterId);
  
    try {
      // Attempt to delete the image from Firebase Storage if it exists
      if (character?.image) {
        const imageRef = ref(storage, `characters/${id}/${character.image}`);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting character image:', error);
        }
      }
  
      // Delete the character document from Firestore
      await deleteDoc(characterRef);
  
      // Navigate back to the characters list after deletion
      navigate(`/story/${id}/characters`);
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">

      <h1 className="text-3xl mb-8">{character?.name || 'Unnamed Character'}</h1>

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded">
            Delete Character
          </button>
          <Link to={`/story/${id}/characters`} className="text-blue-500 underline">
            Back to Characters List
          </Link>
        </div>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <strong>Birthdate:</strong> {character?.birthdate || 'Unknown Birthdate'}
        </div>
        <div className="mb-4">
          <strong>Age:</strong> {character?.age || 'Unknown Age'}
        </div>
        <div className="mb-4">
          <strong>Height:</strong> {character?.height || 'Unknown Height'}
        </div>
        <div className="mb-4">
          <strong>Weight:</strong> {character?.weight || 'Unknown Weight'}
        </div>
        <div className="mb-4">
          <strong>Personality:</strong> {character?.personality || 'Undefined Personality'}
        </div>
        <div className="mb-4">
          <strong>Backstory:</strong> {character?.backstory || 'No Backstory Provided'}
        </div>
        <div className="mb-4">
          <strong>Notes:</strong> {character?.notes || 'No Additional Notes'}
        </div>
        {character?.image && (
          <div className="mb-4">
            <strong>Image:</strong>
            <img src={character.image} alt={character.name} className="w-full h-auto mt-4" />
          </div>
        )}
      </div>


    </div>
  );
};

export default CharacterDetails;
