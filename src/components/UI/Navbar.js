import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LogOutButton from "../Auth/LogOutButton";

const Navbar = () => {

    const user = useAuth();

    return ( 
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0">
        <Link to={user ? '/homepage' : '/'}><h1 className="text-2xl">StoryNotes</h1></Link>
        {user ? <LogOutButton /> : <Link to={'/authcard'}>Sign Up/Login</Link>}
      </header>
     );
}
 
export default Navbar;