import { Link } from "react-router-dom";
import backgroundVideo from './Aesthetic Bundle.mp4'; // Ensure the correct path

const LandingPage = () => {
  return (
    <div className="relative h-screen w-full">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={backgroundVideo}
        autoPlay
        loop
        muted
      ></video>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <div className="bg-black bg-opacity-60 p-10 rounded-lg shadow-lg text-center max-w-lg backdrop-blur-md">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Welcome to <span className="text-pink-400">HazyNotes!</span>
          </h1>
          <p className="text-xl font-light mb-6">
            The all-in-one platform for writers and creators to shape their
            stories. Organize characters, plots, and worlds effortlessly.
          </p>
          <p className="text-lg mb-8 font-medium">
            Start organizing your ideas and let your stories unfold!
          </p>
          <div className="space-x-4 flex justify-center">
            <Link
              to="/authcard?isSignUp=true"
              className=" border-2 border-sky-300 hover:bg-pink-400 font-semibold px-6 py-3 rounded-full transition duration-300"
            >
              Get Started!
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
