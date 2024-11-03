import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { HomeIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user } = useAuth(); // Destructure user from useAuth

  return (
    <header className="bg-gradient-to-r from-sky-300 to-teal-400 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
      {/* Left Section - Brand */}
      <div className="flex items-center space-x-4">
        <Link
          to={user ? "/homepage" : "/"}
          className="text-3xl italic font-bold tracking-wide hover:text-pink-500 transition duration-300 flex items-center"
        >
          <span>HazyNotes</span>
        </Link>
      </div>

      {/* Right Section - Navigation and User Info */}
      <div className="flex items-center space-x-6">
        {user ? ( // If user is logged in
          <>
            {/* Home Link */}
            <Link to="/homepage" className="hover:text-pink-500 transition duration-300 flex items-center">
              <HomeIcon className="w-6 h-6 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center space-x-2 hover:text-pink-500 transition duration-300"
            >
              <UserCircleIcon className="w-8 h-8" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </>
        ) : ( // If user is not logged in
          <Link
            to="/authcard"
            className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-400 transition duration-300 shadow-md flex items-center"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
