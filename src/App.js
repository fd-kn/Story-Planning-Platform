// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import CreateCharacter from './components/Characters/CreateCharacter';
import Characters from './components/Characters/Characters';
import CharacterDetails from './components/Characters/CharacterDetails';
import Locations from './components/Locations/Locations';
import LocationDetails from './components/Locations/LocationDetails';
import CreateLocation from './components/Locations/CreateLocation';
import Plots from './components/Plots/Plots';
import CreatePlot from './components/Plots/CreatePlot';
import PlotDetails from './components/Plots/PlotDetails';
import Events from './components/Events/Events';
import CreateEvent from './components/Events/CreateEvent';
import EventDetails from './components/Events/EventDetails';
import Notes from './components/Notes/Notes';
import CreateNote from './components/Notes/CreateNote';
import NoteDetails from './components/Notes/NoteDetails';
import Gallery from './components/Gallery/Gallery';
import CreateGalleryItem from './components/Gallery/CreateGalleryItem';
import GalleryItemDetails from './components/Gallery/GalleryItemDetails';

function App() {
  const user = useAuth();

  const [usernameExists, setUsernameExists] = useState(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().username) {
          setUsernameExists(true);
        } else {
          setUsernameExists(false);
        }
      }
    };

    checkUsername();
  }, [user]);


  return (
    <Router>
      <div className="App">
      <Navbar />

        <Routes>

          {user ? (
            usernameExists === false ? (
              <Route path="/setup-username" element={<UsernameSetup />} />
            ) : (
              <>
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/newstorytitle" element={<NewStoryTitle />} />
                <Route path="/mystories" element={<MyStories />} />
                <Route path="/story/:id" element={<StoryDetails />} />
                <Route path="/story/:id/characters" element={<Characters />} />
                <Route path="/story/:id/create-character" element={<CreateCharacter />} />
                <Route path="/story/:id/characters/:characterId" element={<CharacterDetails />} />
                <Route path="/story/:id/locations" element={<Locations />} />
                <Route path="/story/:id/locations/:locationId" element={<LocationDetails />} />
                <Route path="/story/:id/create-location" element={<CreateLocation />} />
                <Route path="/story/:id/plots" element={<Plots />} />
                <Route path="/story/:id/create-plot" element={<CreatePlot />} />
                <Route path="/story/:id/plots/:plotId" element={<PlotDetails />} />
                <Route path="/story/:id/events" element={<Events />} />
                <Route path="/story/:id/create-event" element={<CreateEvent />} />
                <Route path="/story/:id/events/:eventId" element={<EventDetails />} />
                <Route path="/story/:id/notes" element={<Notes />} />
                <Route path="/story/:id/create-note" element={<CreateNote />} />
                <Route path="/story/:id/notes/:noteId" element={<NoteDetails />} />
                <Route path="/story/:id/gallery" element={<Gallery />} />
                <Route path="/story/:id/create-gallery-item" element={<CreateGalleryItem />} />
                <Route path="/story/:id/gallery/:galleryItemId" element={<GalleryItemDetails />} />
              </>
            )
            
          ) : (
            <>
                <Route path='/' element={<LandingPage />}/>
                <Route path="/authcard" element={<AuthCard />} />
            </>

          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
