import { Link } from "react-router-dom";


const LandingPage = () => {

  return (

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to StoryNotes!</h1>
          <p className="mt-4">
            <Link to="/authcard" className="text-blue-500 underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link to="/authcard" className="text-blue-500 underline">
              Sign up
            </Link>{" "}
            to get started.
          </p>
        </div>
      
    </div>
  );
};

export default LandingPage;
