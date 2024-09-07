import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

const GalleryItemDetails = () => {
  const { id, galleryItemId } = useParams(); // Story ID and Gallery Item ID from the URL
  const [galleryItem, setGalleryItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      const galleryItemRef = doc(db, `stories/${id}/gallery`, galleryItemId);
      const galleryItemDoc = await getDoc(galleryItemRef);
      if (galleryItemDoc.exists()) {
        setGalleryItem(galleryItemDoc.data());
      } else {
        console.log('No such gallery item!');
      }
      setLoading(false);
    };

    fetchGalleryItem();
  }, [id, galleryItemId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">{galleryItem?.caption || 'Untitled Gallery Item'}</h1>

      <div className="w-full max-w-2xl">
        {galleryItem?.image && (
          <div className="mb-4">
            <strong>Image:</strong>
            <img src={galleryItem.image} alt={galleryItem.caption} className="w-full h-auto mt-4" />
          </div>
        )}
      </div>

      <Link to={`/story/${id}/gallery`} className="mt-4 text-blue-500 underline">
        Back to Gallery List
      </Link>
    </div>
  );
};

export default GalleryItemDetails;
