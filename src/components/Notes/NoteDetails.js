import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

const NoteDetails = () => {
  const { id, noteId } = useParams(); // Story ID and Note ID from the URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const noteRef = doc(db, `stories/${id}/notes`, noteId);
      const noteDoc = await getDoc(noteRef);
      if (noteDoc.exists()) {
        setNote(noteDoc.data());
      } else {
        console.log('No such note!');
      }
      setLoading(false);
    };

    fetchNote();
  }, [id, noteId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">{note?.title || 'Untitled Note'}</h1>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <strong>Note:</strong> {note?.note || 'No Note Content'}
        </div>
      </div>

      <Link to={`/story/${id}/notes`} className="mt-4 text-blue-500 underline">
        Back to Notes List
      </Link>
    </div>
  );
};

export default NoteDetails;
