import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const user = useAuth();

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, [user]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Home</h1>
        {isLoading && (<p>Loading...</p>)}
        {user && username && (
            <>
                <p className="text-xl mt-4">
                    Welcome, {username}!
                </p>
                <div className=''>
                    <Link to='/newstorytitle'><button className='p-2'>Create</button></Link>
                    <Link to='/mystories'><button className='p-2'>View Stories</button></Link>
                </div>


            </>

        )}
      </div>
    </div>
  );
};

export default Homepage;
