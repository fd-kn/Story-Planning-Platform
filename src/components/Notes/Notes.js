import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Notes = () => {
  const { id } = useParams(); // Story ID from the URL
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const q = query(collection(db, `stories/${id}/notes`));
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
      setLoading(false);
    };

    fetchNotes();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Notes</h1>

      {notes.length > 0 ? (
        <ul className="mb-8">
          {notes.map((note) => (
            <li key={note.id} className="mb-2">
              <Link to={`/story/${id}/notes/${note.id}`} className="text-blue-500 underline">
                {note.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notes yet.</p>
      )}

      <Link
        to={`/story/${id}/create-note`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Note
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Notes;
