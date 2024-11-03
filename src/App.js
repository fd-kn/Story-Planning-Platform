// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import AuthCard from './components/Auth/AuthCard';
import Homepage from './components/UI/Homepage';
import LandingPage from './components/UI/LandingPage';
import Navbar from './components/UI/Navbar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';
import UsernameSetup from './components/UI/UsernameSetup';
import NewStoryTitle from './components/Stories/NewStoryTitle';
import MyStories from './components/Stories/MyStories';
import StoryDetails from './components/Stories/StoryDetails';
import Profile from './components/UI/Profile';
import CategoriesPage from './components/Pages/CategoriesPage';
import CreateCategoryPage from './components/Pages/CreateCategoryPage';
import DetailsPage from './components/Pages/DetailsPage';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [usernameExists, setUsernameExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsername = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists() && userDoc.data().username) {
            setUsernameExists(true);
          } else {
            setUsernameExists(false);
          }
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameExists(false);
        }
      } else {
        setUsernameExists(false);
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkUsername();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/authcard" element={<AuthCard />} />
          {user ? (
            <>
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/setup-username" element={<UsernameSetup />} />
              <Route path="/newstorytitle" element={<NewStoryTitle />} />
              <Route path="/mystories" element={<MyStories />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/story/:id" element={<StoryDetails />} />
              <Route path="/story/:id/:category" element={<CategoriesPage />} />
              <Route path="/story/:id/create/:category" element={<CreateCategoryPage />} />
              <Route path="/story/:id/:category/:itemId" element={<DetailsPage />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/authcard" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
