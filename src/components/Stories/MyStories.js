import React, { useEffect, useState } from 'react';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const user = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      if (user) {
        const q = query(collection(db, 'stories'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userStories = [];
        querySnapshot.forEach((doc) => {
          userStories.push({ id: doc.id, ...doc.data() });
        });
        setStories(userStories);
      }
    };

    fetchStories();
  }, [user]);

  return (
    <div>
        <Link to={'/homepage'}>Back</Link>
      <h2 className="text-xl mb-4">Your Stories</h2>
      {stories.length === 0 ? (
        <p>No stories found.</p>
      ) : (
        <ul>
          {stories.map((story) => (
           <li key={story.id} className="border-b py-2">
                <Link to={`/story/${story.id}`}>{story.title}</Link> 
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyStories;
