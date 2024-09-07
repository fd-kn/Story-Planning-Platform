import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query } from 'firebase/firestore';

const Gallery = () => {
  const { id } = useParams(); // Story ID from the URL
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const q = query(collection(db, `stories/${id}/gallery`));
      const querySnapshot = await getDocs(q);
      const galleryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryItems(galleryList);
      setLoading(false);
    };

    fetchGalleryItems();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Gallery</h1>

      {galleryItems.length > 0 ? (
        <ul className="mb-8">
          {galleryItems.map((item) => (
            <li key={item.id} className="mb-2">
              <Link to={`/story/${id}/gallery/${item.id}`} className="text-blue-500 underline">
                {item.caption}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No gallery items yet.</p>
      )}

      <Link
        to={`/story/${id}/create-gallery-item`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Gallery Item
      </Link>

      <Link to={`/story/${id}`} className="mt-4 text-blue-500 underline">
        Back to Story Details
      </Link>
    </div>
  );
};

export default Gallery;
