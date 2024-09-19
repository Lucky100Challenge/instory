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

interface DashboardProps {
  stories: Story[];
  onNewStory: () => void;
  onViewGallery: () => void;
  onSelectStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stories, onNewStory, onViewGallery, onSelectStory, onDeleteStory }) => {
  const totalStories = stories.length;
  const genreCounts = stories.reduce((acc, story) => {
    acc[story.genre] = (acc[story.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-900">Your Story Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-blue-800">Total Stories</h3>
          <p className="text-3xl font-bold text-blue-900">{totalStories}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-purple-800">Favorite Genre</h3>
          <p className="text-3xl font-bold text-purple-900">{mostCommonGenre}</p>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-blue-800">Recent Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.slice(-3).reverse().map((story) => (
            <motion.div 
              key={story.id} 
              className="bg-white p-4 rounded-lg shadow-md relative"
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="text-lg font-semibold mb-2 text-blue-900">{story.title}</h4>
              <p className="text-blue-800">{story.genre} - {story.theme}</p>
              <div className="mt-4 flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectStory(story)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeleteStory(story.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewStory}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-serif text-xl shadow-md"
        >
          Create New Story
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewGallery}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-serif text-xl shadow-md"
        >
          View All Stories
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;