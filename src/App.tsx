import React, { useState, useEffect } from 'react';
import { Clock, ThumbsUp, ThumbsDown, Send, LogIn } from 'lucide-react';
import { generateUsername } from './utils/username';
import { Thought } from './types';
import { db, auth } from './firebase';
import { ref, onValue, push, update, serverTimestamp, query, limitToLast } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

const INITIAL_LIFESPAN = 5 * 60; // 5 minutes in seconds
const LIKE_BONUS = 60; // 1 minute bonus
const DISLIKE_PENALTY = 30; // 30 seconds penalty

function App() {
  const [username, setUsername] = useState('');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newThought, setNewThought] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const thoughtsRef = query(ref(db, 'thoughts'), limitToLast(50)); // Fetch last 50 thoughts
    const unsubscribe = onValue(thoughtsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const thoughtsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setThoughts(thoughtsList.sort((a, b) => b.createdAt - a.createdAt));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      thoughts.forEach((thought) => {
        const elapsedTime = (now - thought.createdAt) / 1000;
        const remainingLifespan = Math.max(0, thought.initialLifespan - elapsedTime);
        if (remainingLifespan === 0) {
          update(ref(db, `thoughts/${thought.id}`), { expired: true });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [thoughts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newThought.trim() && isLoggedIn) {
      push(ref(db, 'thoughts'), {
        content: newThought,
        author: username,
        initialLifespan: INITIAL_LIFESPAN,
        createdAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
      });
      setNewThought('');
    }
  };

  const handleVote = (id: string, isLike: boolean) => {
    const thoughtRef = ref(db, `thoughts/${id}`);
    update(thoughtRef, {
      [isLike ? 'likes' : 'dislikes']: thoughts.find(t => t.id === id)?.[isLike ? 'likes' : 'dislikes'] + 1 || 1,
      initialLifespan: thoughts.find(t => t.id === id)?.initialLifespan + (isLike ? LIKE_BONUS : -DISLIKE_PENALTY),
    });
  };

  const handleEnter = async () => {
    try {
      setError('');
      await signInAnonymously(auth);
      setIsLoggedIn(true);
      setUsername(generateUsername());
    } catch (error) {
      console.error("Error signing in:", error);
      setError('Failed to enter. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-bold mb-8">ThoughtStream</h1>
        <button 
          onClick={handleEnter} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl inline-flex items-center transition-colors duration-300"
        >
          <LogIn size={24} className="mr-2" /> Enter
        </button>
        {error && <p className="mt-4 text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">ThoughtStream</h1>
        <p className="text-xl mb-2">Your username: <span className="font-semibold">{username}</span></p>
      </header>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Share your thought..."
            className="flex-grow p-2 rounded-l-lg text-gray-800"
          />
          <button type="submit" className="bg-green-500 p-2 rounded-r-lg hover:bg-green-600 transition-colors">
            <Send size={24} />
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {thoughts.filter(thought => !thought.expired).map((thought) => {
          const elapsedTime = (Date.now() - thought.createdAt) / 1000;
          const remainingLifespan = Math.max(0, thought.initialLifespan - elapsedTime);
          return (
            <div key={thought.id} className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-lg">
              <p className="mb-2">{thought.content}</p>
              <div className="flex justify-between items-center text-sm">
                <span>{thought.author}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleVote(thought.id, true)} className="hover:text-green-300 transition-colors">
                    <ThumbsUp size={18} /> {thought.likes || 0}
                  </button>
                  <button onClick={() => handleVote(thought.id, false)} className="hover:text-red-300 transition-colors">
                    <ThumbsDown size={18} /> {thought.dislikes || 0}
                  </button>
                  <span className="flex items-center">
                    <Clock size={18} className="mr-1" />
                    {Math.floor(remainingLifespan / 60)}:{Math.floor(remainingLifespan % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;