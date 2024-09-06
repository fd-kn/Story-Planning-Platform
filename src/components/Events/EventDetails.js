import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

const EventDetails = () => {
  const { id, eventId } = useParams(); // Story ID and Event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = doc(db, `stories/${id}/events`, eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        setEvent(eventDoc.data());
      } else {
        console.log('No such event!');
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id, eventId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">{event?.title || 'Untitled Event'}</h1>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <strong>Description:</strong> {event?.description || 'No Description Provided'}
        </div>
        {event?.image && (
          <div className="mb-4">
            <strong>Image:</strong>
            <img src={event.image} alt={event.title} className="w-full h-auto mt-4" />
          </div>
        )}
      </div>

      <Link to={`/story/${id}/events`} className="mt-4 text-blue-500 underline">
        Back to Events List
      </Link>
    </div>
  );
};

export default EventDetails;
