import React from 'react';
import { motion } from 'framer-motion';

interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  theme: string;
  length: string;
}

interface StoryGalleryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onClose: () => void;
}

const StoryGallery: React.FC<StoryGalleryProps> = ({ stories, onSelectStory, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-900">Story Gallery</h2>
        {stories.length === 0 ? (
          <p className="text-blue-800">No stories saved yet. Start creating!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <motion.div 
                key={story.id} 
                whileHover={{ scale: 1.05 }}
                className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors shadow-md"
                onClick={() => onSelectStory(story)}
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-900">{story.title}</h3>
                <p className="text-blue-800">{story.genre} - {story.theme}</p>
                <p className="text-blue-700">{story.length}</p>
              </motion.div>
            ))}
          </div>
        )}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md"
        >
          Close Gallery
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default StoryGallery;