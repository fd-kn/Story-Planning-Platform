import React, { useState, useRef } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { XCircleIcon } from '@heroicons/react/24/solid';

const CreateCategoryPage = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '' }); // Initialize title in formData
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || uploading) {
      return;
    }

    setIsSubmitting(true);

    let imageUrl = null;
    if (image) {
      setUploading(true);
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${image.name}`;
      const storageRef = ref(storage, `${category}/${id}/${uniqueFileName}`);

      try {
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploading(false);
        setIsSubmitting(false);
        return;
      }
      setUploading(false);
    }

    const itemData = { 
      ...formData, 
      image: imageUrl,
      createdAt: serverTimestamp()
    };

    // For characters, ensure all new fields are included even if empty
    if (category === 'characters') {
      itemData.gender = formData.gender || '';
      itemData.appearance = formData.appearance || '';
      itemData.personality = formData.personality || '';
    }

    try {
      await addDoc(collection(db, 'stories', id, category), itemData);
      navigate(`/story/${id}/${category}`);
    } catch (error) {
      console.error(`Error creating ${category.slice(0, -1)}:`, error);
      alert(`Failed to create ${category.slice(0, -1)}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/story/${id}/${category}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const form = formRef.current;
      const inputs = Array.from(form.elements).filter(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
      const index = inputs.indexOf(e.target);
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
  };

  const renderFields = () => {
    const commonProps = {
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      className: "w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
    };

    const requiredProps = {
      ...commonProps,
      required: true,
      className: `${commonProps.className} border-red-300`
    };

    const textareaProps = {
      onChange: handleInputChange,
      className: `${commonProps.className} h-32`,
    };

    switch (category) {
      case 'characters':
        return (
          <>
            <input name="name" placeholder="Name *" {...requiredProps} />
            <input name="birthdate" placeholder="Birthdate" {...commonProps} />
            <input name="birthplace" placeholder="Birthplace" {...commonProps} />
            <input name="age" type="number" placeholder="Age" {...commonProps} />
            <input name="gender" placeholder="Gender" {...commonProps} />
            <input name="height" placeholder="Height" {...commonProps} />
            <input name="weight" placeholder="Weight" {...commonProps} />
            <textarea name="appearance" placeholder="Appearance" {...textareaProps} />
            <textarea name="personality" placeholder="Personality" {...textareaProps} />
            <textarea name="backstory" placeholder="Backstory" {...textareaProps} />
            <textarea name="notes" placeholder="Notes" {...textareaProps} />
          </>
        );
      case 'locations':
        return (
          <>
            <input name="title" placeholder="Title *" {...requiredProps} /> {/* Title input */}
            <textarea name="description" placeholder="Description" {...textareaProps} />
          </>
        );
      case 'events':
      case 'plots':
        return (
          <>
            <input name="title" placeholder="Title *" {...requiredProps} /> {/* Title input */}
            <textarea name="description" placeholder="Description" {...textareaProps} />
          </>
        );
      case 'notes':
        return (
          <>
            <input name="title" placeholder="Title *" {...requiredProps} /> {/* Title input */}
            <textarea name="note" placeholder="Note" {...textareaProps} />
          </>
        );
      case 'gallery':
        return (
          <>
            <input name="title" placeholder="Title *" {...requiredProps} /> {/* Title input */}
            <input className={`${commonProps.className}`} name="caption" placeholder="Caption "  />
          </>
        );
      default:
        return null;
    }
  };

  // Mapping of categories to their headings, descriptions, and notes
  const categoryDetails = {
    characters: {
      heading: "Create Character",
      description: "Add unique traits and backgrounds to your characters.",
      note: "Most fields can be left blank and edited later!"
    },
    notes: {
      heading: "Create Note",
      description: "Capture important thoughts and ideas for your story.",
      note: "Most fields can be left blank and edited later!"
    },
    gallery: {
      heading: "Create Gallery Item",
      description: "Upload images that enhance your story's visual appeal.",
      note: "Most fields can be left blank and edited later!"
    },
    events: {
      heading: "Create Event",
      description: "Detail significant events that shape your narrative.",
      note: "Most fields can be left blank and edited later!"
    },
    locations: {
      heading: "Create Location",
      description: "Describe the settings where your story unfolds.",
      note: "Most fields can be left blank and edited later!"
    },
    plots: {
      heading: "Create Plot",
      description: "Outline the key plot points that drive your story.",
      note: "Most fields can be left blank and edited later!"
    },
  };

  const currentCategoryDetails = categoryDetails[category] || {
    heading: "Create Item",
    description: "Add details to bring your story to life.",
    note: "Most fields can be left blank and edited later."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-12 px-4 relative overflow-hidden">
      {/* Subtle circle in top-left corner */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      
      {/* Subtle circle in bottom-right corner */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>

      <div className="max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 bg-gradient-to-r from-teal-400 to-blue-500">
          <h1 className="text-4xl font-bold text-white mb-2">{currentCategoryDetails.heading}</h1>
          <p className="text-white text-lg">{currentCategoryDetails.description}</p>
          <p className="text-pink-600 text-sm italic mt-1">{currentCategoryDetails.note}</p>
        </div>

        <div className="p-6">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4" 
            ref={formRef}
          >
            {renderFields()}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <input
                type="file"
                onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            {imagePreview && (
              <div className="mt-4 relative">
                <div className="w-full h-80 relative overflow-hidden rounded-lg">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="absolute h-auto max-h-[300px] object-contain inset-0 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className={`px-6 py-3 rounded-full text-white font-semibold transition-colors duration-300 ${
                  (uploading || isSubmitting)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600'
                }`}
                disabled={uploading || isSubmitting}
              >
                {uploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className={`px-6 py-3 rounded-full text-teal-700 font-semibold transition-colors duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100'
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryPage;
