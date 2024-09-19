"use client";

import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PageFlip from './PageFlip';
import StoryGallery from './StoryGallery';
import Dashboard from './Dashboard';
import { motion } from 'framer-motion';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');

const genres = ['Children', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'];
const themes = ['Dark', 'Humorous', 'Heartwarming', 'Adventurous', 'Mysterious', 'Scary', 'Magical', 'Realistic'];
const storyLengths = ['Short', 'Medium', 'Long'];

interface Choice {
  text: string;
  timeLimit?: number;
}

interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  theme: string;
  length: string;
  ending?: string;
}

export default function StoryGenerator() {
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [storyLength, setStoryLength] = useState('');
  const [story, setStory] = useState('');
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPageFlip, setShowPageFlip] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [activeTimedChoice, setActiveTimedChoice] = useState<Choice | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyEnding, setStoryEnding] = useState<string | null>(null);
  const [timedChoices, setTimedChoices] = useState<Choice[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      console.error('Google API Key is not set');
    }

    // Load saved stories from localStorage
    const loadedStories = localStorage.getItem('savedStories');
    if (loadedStories) {
      setSavedStories(JSON.parse(loadedStories));
    }
  }, []);

  const generateStory = async (userChoice: string = '') => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const lengthInstructions = {
        Short: { min: 80, max: 120 },
        Medium: { min: 200, max: 300 },
        Long: { min: 400, max: 600 }
      };
      const { min, max } = lengthInstructions[storyLength as keyof typeof lengthInstructions];
      
      // Randomly decide if we should introduce an unexpected event
      const introduceUnexpectedEvent = Math.random() < 0.3; // 30% chance

      let prompt = userChoice
        ? `Continue the ${theme.toLowerCase()} ${genre.toLowerCase()} story based on the choice: ${userChoice}. The continuation should be between ${min} and ${max} words long.`
        : `Generate a ${theme.toLowerCase()} ${genre.toLowerCase()} story opening between ${min} and ${max} words long.`;

      if (introduceUnexpectedEvent) {
        prompt += ` Introduce an unexpected event or plot twist that adds excitement or mystery to the story. This should be a surprise element that fits the genre and theme but isn't directly related to the previous choice.`;
      }

      prompt += ` End with 3 new choices for the user, preceded by the word "Choices:". Randomly assign a time limit (in seconds) to some choices, indicating urgency. Format: "Choice: [text] (Time: [seconds]s)" for timed choices, and "Choice: [text]" for untimed ones.`;

      let result;
      let text;
      let wordCount;
      let attempts = 0;
      const maxAttempts = 3;

      do {
        result = await model.generateContent(prompt);
        text = result.response.text();
        const [storyPart] = text.split('Choices:');
        wordCount = storyPart.trim().split(/\s+/).length;
        attempts++;
      } while ((wordCount < min || wordCount > max) && attempts < maxAttempts);

      if (attempts === maxAttempts) {
        console.warn(`Failed to generate story of correct length after ${maxAttempts} attempts.`);
      }

      console.log('API Response:', text);

      let newStory: string;
      let newChoices: Choice[] = [];

      if (text.includes('Choices:')) {
        const [storyPart, choicesPart] = text.split('Choices:');
        newStory = storyPart.trim();
        newChoices = choicesPart.split('\n')
          .filter(choice => choice.trim() !== '')
          .map(choice => {
            const timeMatch = choice.match(/\(Time: (\d+)s\)/);
            return {
              text: choice.replace(/\(Time: \d+s\)/, '').trim(),
              timeLimit: timeMatch ? parseInt(timeMatch[1], 10) : undefined
            };
          });
        setTimedChoices(newChoices.filter(choice => choice.timeLimit !== undefined));
      } else {
        newStory = text;
        console.warn('No choices found in the API response');
      }

      // If an unexpected event was introduced, highlight it in the UI
      if (introduceUnexpectedEvent) {
        newStory = `<span class="text-purple-600 font-bold">Unexpected event:</span> ${newStory}`;
      }

      setStory((prevStory) => prevStory + '\n\n' + newStory.trim());
      setChoices(newChoices);

      if (newChoices.length === 0) {
        console.warn('No choices generated. Requesting new choices...');
        const choicesResult = await model.generateContent(`Generate 3 choices for the user to continue the ${theme.toLowerCase()} ${genre.toLowerCase()} story. Randomly assign a time limit (in seconds) to some choices, indicating urgency. Format: "Choice: [text] (Time: [seconds]s)" for timed choices, and "Choice: [text]" for untimed ones.`);
        const choicesText = choicesResult.response.text();
        setChoices(choicesText.split('\n')
          .filter(choice => choice.trim() !== '')
          .map(choice => {
            const timeMatch = choice.match(/\(Time: (\d+)s\)/);
            return {
              text: choice.replace(/\(Time: \d+s\)/, '').trim(),
              timeLimit: timeMatch ? parseInt(timeMatch[1], 10) : undefined
            };
          }));
      }

    } catch (error: unknown) {
      console.error('Error generating story:', error);
      setStory(`An error occurred while generating the story: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
    setIsLoading(false);
  };

  const handleGenreSelect = (selectedGenre: string) => {
    setGenre(selectedGenre);
  };

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  const handleLengthSelect = (selectedLength: string) => {
    setStoryLength(selectedLength);
    setStory('');
    setChoices([]);
    generateStory();
  };

  const handleChoice = (choice: Choice) => {
    setSelectedChoice(choice.text);
    setIsLoading(true);
    setTimedChoices([]);
    setTimeout(() => {
      setShowPageFlip(true);
    }, 1000);
  };

  useEffect(() => {
    // Set up timer for timed choices
    const timerInterval = setInterval(() => {
      setTimedChoices((prevChoices) =>
        prevChoices.map((choice) => {
          if (choice.timeLimit && choice.timeLimit > 0) {
            return { ...choice, timeLimit: choice.timeLimit - 1 };
          }
          return choice;
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    // Check if any timed choice has reached 0
    const expiredChoice = timedChoices.find((choice) => choice.timeLimit === 0);
    if (expiredChoice) {
      handleChoice(expiredChoice);
    }
  }, [timedChoices]);

  const handlePageFlipComplete = () => {
    setShowPageFlip(false);
    generateStory(selectedChoice);
  };

  const handleSave = () => {
    const newStory: Story = {
      id: Date.now().toString(),
      title: `${theme} ${genre} Story (${storyLength})`,
      content: story,
      genre,
      theme,
      length: storyLength,
      ending: storyEnding || undefined,
    };
    const updatedStories = [...savedStories, newStory];
    setSavedStories(updatedStories);
    localStorage.setItem('savedStories', JSON.stringify(updatedStories));
    alert('Story saved to gallery!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My ${theme} ${genre} Story (${storyLength})`,
        text: story,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  const handleRestart = () => {
    setGenre('');
    setTheme('');
    setStoryLength('');
    setStory('');
    setChoices([]);
    setStoryProgress(0);
    setStoryEnding(null);
  };

  const handleSelectStory = (selectedStory: Story) => {
    setGenre(selectedStory.genre);
    setTheme(selectedStory.theme);
    setStoryLength(selectedStory.length);
    setStory(selectedStory.content);
    setChoices([]);
    setShowGallery(false);
  };

  const handleNewStory = () => {
    setShowDashboard(false);
    handleRestart();
  };

  const handleViewGallery = () => {
    setShowGallery(true);
  };

  const handleDeleteStory = (storyId: string) => {
    const updatedStories = savedStories.filter(story => story.id !== storyId);
    setSavedStories(updatedStories);
    localStorage.setItem('savedStories', JSON.stringify(updatedStories));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-8 border-double border-blue-200 rounded-lg shadow-2xl relative overflow-hidden"
    >
      {showPageFlip && <PageFlip onAnimationComplete={handlePageFlipComplete} />}
      {showGallery && (
        <StoryGallery 
          stories={savedStories} 
          onSelectStory={handleSelectStory} 
          onClose={() => setShowGallery(false)} 
        />
      )}
      <h1 className="text-5xl font-bold mb-8 text-center text-blue-900 font-serif">Interactive Story Book</h1>
      
      {showDashboard ? (
        <Dashboard 
          stories={savedStories}
          onNewStory={handleNewStory}
          onViewGallery={handleViewGallery}
          onSelectStory={(story) => {
            handleSelectStory(story);
            setShowDashboard(false);
          }}
          onDeleteStory={handleDeleteStory}
        />
      ) : (
        <>
          {!genre && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-semibold mb-4 text-center text-blue-800 font-serif">Choose your genre:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {genres.map((g) => (
                  <motion.button
                    key={g}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenreSelect(g)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-serif text-xl shadow-md"
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {genre && !theme && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-semibold mb-4 text-center text-blue-800 font-serif">Choose your theme:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {themes.map((t) => (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeSelect(t)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-serif text-xl shadow-md"
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {genre && theme && !storyLength && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-semibold mb-4 text-center text-blue-800 font-serif">Choose your story length:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {storyLengths.map((l) => (
                  <motion.button
                    key={l}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLengthSelect(l)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-serif text-xl shadow-md"
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {genre && theme && storyLength && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-4 text-center text-blue-800 font-serif">{theme} {genre} Tale ({storyLength})</h2>
                <div className="bg-white p-6 rounded-lg border-4 border-blue-200 shadow-inner">
                  <p className="whitespace-pre-wrap text-gray-800 font-serif text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: story }}></p>
                  {storyEnding && (
                    <>
                      <h3 className="text-2xl font-semibold mt-6 mb-2 text-center text-blue-800 font-serif">The End</h3>
                      <p className="whitespace-pre-wrap text-gray-800 font-serif text-lg leading-relaxed italic">{storyEnding}</p>
                    </>
                  )}
                </div>
              </div>

              {choices.length > 0 && !isLoading && !showPageFlip && !storyEnding && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4 text-center text-blue-800 font-serif">What happens next?</h3>
                  <div className="flex flex-col gap-4">
                    {choices.map((choice, index) => (
                      <motion.div key={index} className="relative" whileHover={{ scale: 1.02 }}>
                        <button
                          onClick={() => handleChoice(choice)}
                          className={`w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-serif text-xl shadow-md ${choice.timeLimit ? 'border-2 border-red-500' : ''}`}
                        >
                          {choice.text}
                        </button>
                        {choice.timeLimit !== undefined && (
                          <>
                            <motion.div 
                              className="absolute top-0 left-0 h-full bg-red-500 opacity-30 rounded-lg"
                              initial={{ width: '100%' }}
                              animate={{ width: '0%' }}
                              transition={{ duration: choice.timeLimit, ease: 'linear' }}
                            />
                            <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white font-bold">
                              {timedChoices.find(c => c.text === choice.text)?.timeLimit || choice.timeLimit}s
                            </span>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {(isLoading || showPageFlip) && (
                <div className="mb-8 text-center">
                  <p className="text-2xl font-semibold text-blue-800 font-serif">
                    Turning page...
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-serif text-xl shadow-md"
                >
                  Save Tale
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-serif text-xl shadow-md"
                >
                  Share Tale
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={storyEnding ? handleRestart : () => setShowDashboard(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-serif text-xl shadow-md"
                >
                  {storyEnding ? 'Start New Story' : 'Back to Dashboard'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}