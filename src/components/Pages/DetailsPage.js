import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { deleteObject, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from '../UI/Modal';
import { PencilIcon, TrashIcon, ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import TheDefaultCharacterImage from '../../defaultimages/TheDefaultCharacter.jpg';
import TheDefaultLocationImage from '../../defaultimages/TheDefaultLocation.jpg';
import TheDefaultEventImage from '../../defaultimages/TheDefaultEvent.jpg';
import TheDefaultPlotImage from '../../defaultimages/TheDefaultPlot.jpg';
import TheDefaultGalleryImage from '../../defaultimages/TheDefaultGallery.jpg';
import TheDefaultNoteImage from '../../defaultimages/TheDefaultNotes.jpg';

// Define default images for each category
const DEFAULT_IMAGES = {
  characters: TheDefaultCharacterImage,
  notes: TheDefaultNoteImage,
  gallery: TheDefaultGalleryImage,
  events: TheDefaultEventImage,
  locations: TheDefaultLocationImage,
  plots: TheDefaultPlotImage
};

// Increase the maximum image size
const MAX_IMAGE_SIZE = 1200; // Maximum width or height in pixels

const resizeImage = (file, maxSize) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Only resize if the image is larger than maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height *= maxSize / width;
            width = maxSize;
          } else {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const DetailsPage = () => {
  const { category, id, itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const defaultImage = DEFAULT_IMAGES[category] || 'default_generic';

  useEffect(() => {
    const fetchItem = async () => {
      const itemRef = doc(db, `stories/${id}/${category}`, itemId);
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        const itemData = itemDoc.data();
        setItem(itemData);
        setEditForm(itemData);
        setPreviewImage(itemData.image || defaultImage);
      } else {
        console.log(`No such ${category} item!`);
      }
      setLoading(false);
    };

    fetchItem();
  }, [category, id, itemId, defaultImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file, MAX_IMAGE_SIZE);
        setImageFile(resizedImage);
        const imagePreviewUrl = URL.createObjectURL(resizedImage);
        setPreviewImage(imagePreviewUrl);
      } catch (error) {
        console.error('Error resizing image:', error);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setEditForm({ ...editForm, image: defaultImage });
    setPreviewImage(defaultImage);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = ''; // Reset the file input
    }
  };

  const handleSave = async () => {
    const itemRef = doc(db, `stories/${id}/${category}`, itemId);

    try {
      if (imageFile) {
        const imageRef = ref(storage, `${category}/${id}/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);
        editForm.image = imageUrl;
      } else if (category === 'characters' && (!editForm.image || editForm.image === defaultImage)) {
        editForm.image = DEFAULT_IMAGES.characters;
      }

      await updateDoc(itemRef, editForm);
      setItem(editForm);
      setIsEditing(false);
      window.location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error(`Error updating ${category}:`, error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(item);
    setImageFile(null);
    setPreviewImage(item?.image || defaultImage);
    window.location.reload(); // Reload the page to reset the state
  };

  const handleDelete = async () => {
    const itemRef = doc(db, `stories/${id}/${category}`, itemId);
    try {
      // Check if the item has an image and it's not the default image
      if (item?.image && item.image !== defaultImage) {
        const imageRef = ref(storage, `${category}/${id}/${item.image.split('/').pop()}`);
        try {
          await deleteObject(imageRef); // Attempt to delete the image
        } catch (error) {
          // Log the error but do not prevent the document deletion
          console.error(`Error deleting image:`, error);
        }
      }

      // Now delete the document
      await deleteDoc(itemRef);
      navigate(`/story/${id}/${category}`);
    } catch (error) {
      console.error(`Error deleting ${category}:`, error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const renderFields = () => {


    switch (category) {
      case 'characters':
        return (
          <>
            <InputField name="name" label="Name" value={editForm.name} onChange={handleChange} required />
            <InputField name="birthdate" label="Birthdate" value={editForm.birthdate} onChange={handleChange} />
            <InputField name="birthplace" label="Birthplace" value={editForm.birthplace} onChange={handleChange} />
            <InputField name="age" label="Age" value={editForm.age} onChange={handleChange} type="number" />
            <InputField name="gender" label="Gender" value={editForm.gender} onChange={handleChange} />
            <InputField name="height" label="Height" value={editForm.height} onChange={handleChange} />
            <InputField name="weight" label="Weight" value={editForm.weight} onChange={handleChange} />
            <TextAreaField name="appearance" label="Appearance" value={editForm.appearance} onChange={handleChange} />
            <TextAreaField name="personality" label="Personality" value={editForm.personality} onChange={handleChange} />
            <TextAreaField name="backstory" label="Backstory" value={editForm.backstory} onChange={handleChange} />
            <TextAreaField name="notes" label="Notes" value={editForm.notes} onChange={handleChange} />
          </>
        );
      case 'locations':
        return (
          <>
            <InputField name="title" label="Title" value={editForm.title} onChange={handleChange} required />
            <TextAreaField name="description" label="Description" value={editForm.description} onChange={handleChange} />
          </>
        );
      case 'events':
      case 'plots':
        return (
          <>
            <InputField name="title" label="Title" value={editForm.title} onChange={handleChange} required />
            <TextAreaField name="description" label="Description" value={editForm.description} onChange={handleChange} />
          </>
        );
      case 'notes':
        return (
          <>
            <InputField name="title" label="Title" value={editForm.title} onChange={handleChange} required />
            <TextAreaField name="note" label="Note" value={editForm.note} onChange={handleChange} />
          </>
        );
      case 'gallery':
        return (
          <>
            <InputField name="title" label="Title" value={editForm.title} onChange={handleChange} required />
            <InputField name="caption" label="Caption" value={editForm.caption} onChange={handleChange} required />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      </div>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto bg-white border-2 border-pink-200 shadow-pink-500 rounded-xl shadow-lg overflow-hidden relative z-10">
        <div className="p-8">
          {/* Action Buttons */}
          <div className="flex justify-between mb-8">
            <Link
              to={`/story/${id}/${category}`}
              className="flex items-center px-4 py-2 bg-pink-300 text-white rounded-lg hover:bg-pink-400 transition duration-300"
            >
              <ArrowLeftIcon className=" h-5 w-10 " />
              
            </Link>
            {!isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg hover:from-teal-500 hover:to-blue-600 transition duration-300"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="  p-8 ">
            {isEditing ? (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                const nameOrTitle = editForm.name || editForm.title;
                if (nameOrTitle && nameOrTitle.trim() !== '') {
                  setIsSaveModalOpen(true);
                } 
              }} className="space-y-6">
                {renderFields()}
                <ImageUploadField
                  previewImage={previewImage}
                  handleImageChange={handleImageChange}
                  handleRemoveImage={handleRemoveImage}
                  showRemoveButton={item?.image && item.image !== defaultImage}
                />
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-white text-teal-700 rounded-lg hover:bg-gray-100 transition duration-300"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg hover:from-teal-500 hover:to-blue-600 transition duration-300"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Title */}
                
                <h1 className="text-4xl font-bold text-pink-500 mb-8 text-center">
                  {item?.name || item?.title || 'Untitled'}
                </h1>
 
                {category === 'characters' ? (
                  <div className="flex mb-8"> {/* Flex container for image and details */}
                    {/* Image for Characters */}
                    <div className="w-1/3 mr-10"> {/* Image takes 1/3 of the width */}
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src={item.image || DEFAULT_IMAGES.characters} 
                          alt={item.name || 'Character'} 
                          className="w-full h-auto max-h-[600px] object-contain" // Original size for viewing
                        />
                      </div>
                    </div>
                    
                    {/* Basic Info for Characters */}
                    <div className="w-2/3"> {/* Details take 2/3 of the width */}
                      <div className="grid grid-cols-2 gap-4 mb-6"> {/* Add margin bottom for spacing */}
                        <DisplayField label="Birthdate" value={item.birthdate} />
                        <DisplayField label="Birthplace" value={item.birthplace} />
                        <DisplayField label="Age" value={item.age} />
                        <DisplayField label="Gender" value={item.gender} />
                        <DisplayField label="Height" value={item.height} />
                        <DisplayField label="Weight" value={item.weight} />
                      </div>
                    </div>
                  </div>
                ) : category === 'gallery' ? (
                  <div className="flex flex-col items-center mb-8"> {/* Center the image and text */}
                    <div>
                      <img 
                        src={item.image || DEFAULT_IMAGES.gallery} 
                        alt={item.name || 'Gallery Item'} 
                        className="w-full h-auto max-h-[600px] object-contain rounded-2xl" // Original size for viewing
                      />
                    </div>
                    <p className="text-gray-500 mt-2"> {/* Display caption below the image */}
                      {editForm.caption ? editForm.caption : 'No caption...'}
                    </p>
                  </div>
                ) : ( // For other categories
                  <div className="flex flex-col items-center mb-8"> {/* Center the image */}
                    <div className="mb-10"> {/* Limit the max width of the image */}
                      <img 
                      src={item.image || DEFAULT_IMAGES[category]} 
                      alt={item.name || item.title || 'Untitled'} 
                      className="w-full h-auto max-h-[300px] object-contain rounded-2xl" // Keep original size
                      />
                    </div>
                  <div className="w-full mt-4"> {/* Text spans across the page */}
                    <DisplayFields item={item} category={category} />
                  </div>
                </div>
                )}

                {/* Additional Character Fields Below the Image */}
                {category === 'characters' && (
                  <div className="mt-6 w-full"> {/* Full width for character details */}
                    <DisplayField label="Appearance" value={item.appearance} />
                    <DisplayField label="Personality" value={item.personality} />
                    <DisplayField label="Backstory" value={item.backstory} />
                    <DisplayField label="Notes" value={item.notes} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirm Delete</h2>
        <p>Are you sure you want to delete this item?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 bg-white text-teal-700 rounded hover:bg-gray-100 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDelete();
              setIsDeleteModalOpen(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirm Cancel</h2>
        <p>Are you sure you want to discard your changes?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setIsCancelModalOpen(false)}
            className="px-4 py-2 bg-white text-teal-700 rounded hover:bg-gray-100 transition duration-300"
          >
            No, keep editing
          </button>
          <button
            onClick={() => {
              handleCancel();
              setIsCancelModalOpen(false);
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded hover:from-teal-500 hover:to-blue-600 transition duration-300"
          >
            Yes, discard changes
          </button>
        </div>
      </Modal>

      {/* Save Changes Confirmation Modal */}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirm Save Changes</h2>
        <p>Are you sure you want to save your changes?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setIsSaveModalOpen(false)}
            className="px-4 py-2 bg-white text-teal-700 rounded hover:bg-gray-100 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSave();
              setIsSaveModalOpen(false);
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded hover:from-teal-500 hover:to-blue-600 transition duration-300"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

const InputField = ({ name, label, value, onChange, required = false, type = "text" }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const TextAreaField = ({ name, label, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="4"
    />
  </div>
);

const ImageUploadField = ({ previewImage, handleImageChange, handleRemoveImage, showRemoveButton, category }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">Image:</label>
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {previewImage && (
      <div className="mt-4 max-w-2xl mx-auto relative overflow-hidden ">
        <div >
          <img 
            src={category === 'characters' && previewImage === DEFAULT_IMAGES.characters ? DEFAULT_IMAGES.characters : previewImage} 
            alt="Preview" 
            className="w-full h-auto max-h-[300px] object-contain rounded-2xl" 
          />
        </div>
      </div>
    )}
    {showRemoveButton && category !== 'characters' && (
      <button
        type="button"
        onClick={handleRemoveImage}
        className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition duration-300"
      >
        Remove Image
      </button>
    )}
  </div>
);

const DisplayFields = ({ item, category }) => {
  const fields = {
    characters: ['appearance', 'personality', 'backstory', 'notes'],
    notes: ['note'],
    gallery: ['caption'],
    events: ['description'],
    locations: ['description'],
    plots: ['description'],
  };

  return (
    <div className="space-y-8">
      {fields[category].map((field) => (
        <DisplayField 
          key={field} 
          label={field === 'description' ? '' : field.charAt(0).toUpperCase() + field.slice(1)} 
          value={item[field]} 
        />
      ))}
    </div>
  );
};

const DisplayField = ({ label, value }) => (
  <div className="mb-6">
    {label && <h3 className="text-xl font-semibold text-teal-700 mb-3">{label}:</h3>}
    <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{value || `No ${label || 'information'} provided`}</p>
  </div>
);

export default DetailsPage;
