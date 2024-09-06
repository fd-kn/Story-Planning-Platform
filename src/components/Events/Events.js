import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Events = () => {
  const { id } = useParams(); // Story ID from the URL
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(collection(db, `stories/${id}/events`));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsList);
      setLoading(false);
    };

    fetchEvents();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Events</h1>

      {events.length > 0 ? (
        <ul className="mb-8">
          {events.map((event) => (
            <li key={event.id} className="mb-2">
              <Link to={`/story/${id}/events/${event.id}`} className="text-blue-500 underline">
                {event.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events yet.</p>
      )}

      <Link
        to={`/story/${id}/create-event`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Event
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Events;
