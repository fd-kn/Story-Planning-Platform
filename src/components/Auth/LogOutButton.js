import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseconfig';

const LogOutButton = ({ onLogout, className }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (onLogout) onLogout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      Logout
    </button>
  );
};

export default LogOutButton;
