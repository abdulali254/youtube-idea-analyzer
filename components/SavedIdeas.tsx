"use client";

import { useState, useEffect } from 'react';
import { Idea } from '@prisma/client';
import { Trash2, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type IdeaMetadata = {
  mvpFeatures: string;
  monetization: string;
  technicalImplementation: string;
  keyInsights: string;
  viabilityScore: string;
  marketPotential: string;
  technicalFeasibility: string;
  resourceRequirements: string;
  competition: string;
  supportingEvidence: string;
}

export function SavedIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

 const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?userId=system');
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message || responseData?.error || 'Failed to fetch ideas'
        );
      }

      setIdeas(responseData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ideas';
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (id: string) => {
    const toastId = toast.loading('Deleting idea...');
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete idea:', errorData);
        toast.error('Failed to delete idea', { id: toastId });
        return;
      }

      setIdeas(ideas.filter(idea => idea.id !== id));
      toast.success('Idea deleted successfully', { id: toastId });
    } catch (err) {
      console.error('Error deleting idea:', err);
      toast.error('Failed to delete idea', { id: toastId });
    }
  };

  const likeIdea = async (id: string) => {
    // Optimistically update the UI
    const ideaToUpdate = ideas.find(idea => idea.id === id);
    if (!ideaToUpdate) return;

    const optimisticIdeas = ideas.map(idea =>
      idea.id === id ? { ...idea, likes: idea.likes + 1 } : idea
    );
    setIdeas(optimisticIdeas);

    try {
      const response = await fetch(`/api/ideas/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert optimistic update
        setIdeas(ideas);
        throw new Error(data.error || 'Failed to like idea');
      }

      // Update with actual server data
      setIdeas(currentIdeas => 
        currentIdeas.map(idea => idea.id === id ? data : idea)
      );
      toast.success('Liked idea!');
    } catch (err) {
      console.error('Error liking idea:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to like idea');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteIdea(id);
  };

  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    likeIdea(id);
  };

  useEffect(() => {
    fetchIdeas();

    const handleIdeasUpdated = () => {
      toast.success('New ideas saved successfully');
      fetchIdeas();
    };

    window.addEventListener('ideasUpdated', handleIdeasUpdated);
    return () => {
      window.removeEventListener('ideasUpdated', handleIdeasUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
        {error}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No saved ideas yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              initial={{ scale: 1, opacity: 1 }}
              exit={{
                scale: [1, 1.2, 0],
                opacity: [1, 1, 0],
                filter: [
                  'brightness(1)',
                  'brightness(2)',
                  'brightness(0)'
                ]
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.3, 1]
              }}
              onClick={() => setSelectedIdea(idea)}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-200 shadow-lg cursor-pointer group p-3"
            >
              <div className="relative">
                <div className="absolute right-0 top-0 flex items-center gap-2">
                  <button
                    onClick={(e) => handleLikeClick(e, idea.id)}
                    className="text-gray-400 hover:text-pink-500 transition-colors duration-200 flex items-center gap-1"
                    title="Like idea"
                  >
                    <Heart className="h-4 w-4" fill={idea.likes > 0 ? "currentColor" : "none"} />
                    <span className="text-xs">{idea.likes}</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, idea.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete idea"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-white pr-16 mb-1 line-clamp-1">
                  {idea.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                  {idea.description}
                </p>

                <div className="flex items-center gap-2 text-xs">
                  {idea.metadata && (
                    <>
                      <span className="text-blue-400">
                        Score: {(idea.metadata as IdeaMetadata)?.viabilityScore || 'N/A'}
                      </span>
                      <span className="text-gray-500">•</span>
                    </>
                  )}
                  <span className="text-gray-400 line-clamp-1">
                    {idea.tags[0] || 'No tags'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedIdea(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-800/95 rounded-xl shadow-2xl border border-gray-700"
            >
              <div className="p-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdea(null);
                  }}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-white mb-4">{selectedIdea.title}</h2>
                <p className="text-gray-300 mb-4">{selectedIdea.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedIdea.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {selectedIdea.metadata && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-white mb-2">MVP Features</h3>
                        <p className="text-gray-300 text-sm">
                          {(selectedIdea.metadata as IdeaMetadata)?.mvpFeatures || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-2">Monetization</h3>
                        <p className="text-gray-300 text-sm">
                          {(selectedIdea.metadata as IdeaMetadata)?.monetization || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-white mb-2">Technical Implementation</h3>
                      <p className="text-gray-300 text-sm">
                        {(selectedIdea.metadata as IdeaMetadata)?.technicalImplementation || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-blue-500/5 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-blue-400">Viability Analysis</h3>
                        <span className="text-blue-400 font-semibold">
                          {(selectedIdea.metadata as IdeaMetadata)?.viabilityScore || 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-white">Market Potential</p>
                          <p className="text-gray-300">
                            {(selectedIdea.metadata as IdeaMetadata)?.marketPotential || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-white">Technical Feasibility</p>
                          <p className="text-gray-300">
                            {(selectedIdea.metadata as IdeaMetadata)?.technicalFeasibility || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-white mb-2">Supporting Evidence</h3>
                      <p className="text-gray-300 text-sm">
                        {(selectedIdea.metadata as IdeaMetadata)?.supportingEvidence || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 