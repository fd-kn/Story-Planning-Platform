import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

const PlotDetails = () => {
  const { id, plotId } = useParams(); // Story ID and Plot ID from the URL
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlot = async () => {
      const plotRef = doc(db, `stories/${id}/plots`, plotId);
      const plotDoc = await getDoc(plotRef);
      if (plotDoc.exists()) {
        setPlot(plotDoc.data());
      } else {
        console.log('No such plot!');
      }
      setLoading(false);
    };

    fetchPlot();
  }, [id, plotId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">{plot?.title || 'Untitled Plot'}</h1>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <strong>Description:</strong> {plot?.description || 'No Description Provided'}
        </div>
        {plot?.image && (
          <div className="mb-4">
            <strong>Image:</strong>
            <img src={plot.image} alt={plot.title} className="w-full h-auto mt-4" />
          </div>
        )}
      </div>

      <Link to={`/story/${id}/plots`} className="mt-4 text-blue-500 underline">
        Back to Plots List
      </Link>
    </div>
  );
};

export default PlotDetails;
