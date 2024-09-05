import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Plots = () => {
  const { id } = useParams(); // Story ID from the URL
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlots = async () => {
      const q = query(collection(db, `stories/${id}/plots`));
      const querySnapshot = await getDocs(q);
      const plotsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlots(plotsList);
      setLoading(false);
    };

    fetchPlots();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Plots</h1>

      {plots.length > 0 ? (
        <ul className="mb-8">
          {plots.map((plot) => (
            <li key={plot.id} className="mb-2">
              <Link to={`/story/${id}/plots/${plot.id}`} className="text-blue-500 underline">
                {plot.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No plots yet.</p>
      )}

      <Link
        to={`/story/${id}/create-plot`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Plot
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Plots;
