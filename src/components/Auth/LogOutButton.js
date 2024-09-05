import React from 'react';
import { auth } from '../../firebaseconfig';
import { useNavigate } from 'react-router-dom';

const LogOutButton = () => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if(confirmLogout) {
      try {
        await auth.signOut();
        console.log('User logged out');
        // Redirect to home page or login after logout
        navigate('/');
  
  
      } catch (error) {
        console.error('Error during logout', error);
      }
    };
    }
  

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogOutButton;
