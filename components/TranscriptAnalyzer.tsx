'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { VideoDetails } from '@/components/VideoDetails';
import { useVideo } from '@/context/VideoContext';

const formSchema = z.object({
  youtubeUrl: z.string().url('Please enter a valid YouTube URL')
});

type FormData = z.infer<typeof formSchema>;

interface BusinessIdea {
  ideaName: string;
  description: string;
  targetMarket: string;
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

interface AnalysisResult {
  analysis: string;
  videoTitle: string;
  videoDescription: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export function TranscriptAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const { setVideoDetails } = useVideo();

  const saveIdeaToDatabase = async (idea: BusinessIdea) => {
    try {
      const metadata = {
        mvpFeatures: idea.mvpFeatures || '',
        monetization: idea.monetization || '',
        technicalImplementation: idea.technicalImplementation || '',
        keyInsights: idea.keyInsights || '',
        viabilityScore: idea.viabilityScore || '',
        marketPotential: idea.marketPotential || '',
        technicalFeasibility: idea.technicalFeasibility || '',
        resourceRequirements: idea.resourceRequirements || '',
        competition: idea.competition || '',
        supportingEvidence: idea.supportingEvidence || ''
      };

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: idea.ideaName || '',
          description: idea.description || '',
          tags: [idea.targetMarket || ''].filter(Boolean),
          category: 'AI_GENERATED',
          userId: 'system',
          metadata
        }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        console.error('Server error response:', responseData);
        throw new Error(`Failed to save idea: ${response.status} ${response.statusText} - ${responseData?.message || 'Unknown error'}`);
      }

      console.log('Successfully saved idea:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (analysis?.analysis) {
      const ideas: BusinessIdea[] = [];
      const ideaTexts = analysis.analysis.split('[START_IDEA]')
        .filter(text => text.trim())
        .map(text => text.split('[END_IDEA]')[0].trim());

      ideaTexts.forEach(ideaText => {
        const idea: Partial<BusinessIdea> = {};
        const lines = ideaText.split('\n').map(line => line.trim()).filter(line => line);

        lines.forEach(line => {
          if (line.startsWith('IDEA_NAME:')) idea.ideaName = line.replace('IDEA_NAME:', '').trim();
          if (line.startsWith('DESCRIPTION:')) idea.description = line.replace('DESCRIPTION:', '').trim();
          if (line.startsWith('TARGET_MARKET:')) idea.targetMarket = line.replace('TARGET_MARKET:', '').trim();
          if (line.startsWith('MVP_FEATURES:')) idea.mvpFeatures = line.replace('MVP_FEATURES:', '').trim();
          if (line.startsWith('MONETIZATION:')) idea.monetization = line.replace('MONETIZATION:', '').trim();
          if (line.startsWith('TECHNICAL_IMPLEMENTATION:')) idea.technicalImplementation = line.replace('TECHNICAL_IMPLEMENTATION:', '').trim();
          if (line.startsWith('KEY_INSIGHTS:')) idea.keyInsights = line.replace('KEY_INSIGHTS:', '').trim();
          if (line.startsWith('VIABILITY_SCORE:')) idea.viabilityScore = line.replace('VIABILITY_SCORE:', '').trim();
          if (line.startsWith('MARKET_POTENTIAL:')) idea.marketPotential = line.replace('MARKET_POTENTIAL:', '').trim();
          if (line.startsWith('TECHNICAL_FEASIBILITY:')) idea.technicalFeasibility = line.replace('TECHNICAL_FEASIBILITY:', '').trim();
          if (line.startsWith('RESOURCE_REQUIREMENTS:')) idea.resourceRequirements = line.replace('RESOURCE_REQUIREMENTS:', '').trim();
          if (line.startsWith('COMPETITION:')) idea.competition = line.replace('COMPETITION:', '').trim();
          if (line.startsWith('SUPPORTING_EVIDENCE:')) idea.supportingEvidence = line.replace('SUPPORTING_EVIDENCE:', '').trim();
        });

        if (Object.keys(idea).length > 0) {
          ideas.push(idea as BusinessIdea);
        }
      });

      setBusinessIdeas(ideas);
      
      // Save ideas to database
      const saveIdeas = async () => {
        const toastId = toast.loading('Saving ideas to database...');
        setError(null);
        try {
          // Save ideas in chunks of 3 to avoid overwhelming the server
          const saveInChunks = async (ideas: BusinessIdea[]) => {
            const results = [];
            for (let i = 0; i < ideas.length; i += 3) {
              const chunk = ideas.slice(i, i + 3);
              const chunkResults = await Promise.allSettled(chunk.map(saveIdeaToDatabase));
              results.push(...chunkResults);
              // Add a small delay between chunks
              if (i + 3 < ideas.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
            return results;
          };

          const results = await saveInChunks(ideas);
          
          // Check if any saves failed
          const failures = results.filter(result => result.status === 'rejected');
          if (failures.length > 0) {
            console.error('Some ideas failed to save:', failures);
            setError(`Failed to save ${failures.length} ideas`);
            toast.error(`Failed to save ${failures.length} ideas`, { id: toastId });
          } else {
            toast.success(`Successfully saved ${results.length} ideas!`, { id: toastId });
            window.dispatchEvent(new CustomEvent('ideasUpdated'));
          }
        } catch (error) {
          console.error('Error saving ideas:', error);
          setError('Failed to save ideas to database. Please try again.');
          toast.error('Failed to save ideas to database', { id: toastId });
        }
      };
      
      saveIdeas();
    }
  }, [analysis]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setVideoDetails(null); // Reset video details before new request
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const result = await response.json();
      setAnalysis(result);
      
      // Update video details in context
      if (result) {
        const videoDetails = {
          thumbnailUrl: result.thumbnailUrl,
          videoTitle: result.videoTitle,
          channelTitle: result.channelTitle,
          publishedAt: result.publishedAt,
          videoDescription: result.videoDescription
        };
        console.log('Setting video details:', videoDetails);
        setVideoDetails(videoDetails);
      }
    } catch (err) {
      console.error('Error analyzing video:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setVideoDetails(null); // Reset video details on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('youtubeUrl')}
            type="url"
            placeholder="Paste YouTube URL here"
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.youtubeUrl && (
            <p className="mt-1 text-red-500 text-sm">{errors.youtubeUrl.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Video'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {analysis && (
        <>
          <div className="lg:hidden mb-8 gap-4">
            <VideoDetails
              thumbnailUrl={analysis.thumbnailUrl}
              videoTitle={analysis.videoTitle}
              channelTitle={analysis.channelTitle}
              publishedAt={analysis.publishedAt}
              videoDescription={analysis.videoDescription}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedIdea(idea)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-200 shadow-lg cursor-pointer p-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {idea.ideaName}
                </h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {idea.description}
                </p>

                <div className="flex items-center gap-2 text-xs mt-auto">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                    Score: {idea.viabilityScore}
                  </span>
                  <span className="text-gray-400 line-clamp-1">
                    {idea.targetMarket}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 flex items-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="relative ml-4 w-[90vw] md:w-[600px] max-h-[85vh] overflow-y-auto bg-gray-800/95 rounded-xl shadow-2xl border border-gray-700"
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

                <h2 className="text-xl font-semibold text-white mb-4">{selectedIdea.ideaName}</h2>
                <p className="text-gray-300 mb-4">{selectedIdea.description}</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-white mb-2">MVP Features</h3>
                      <p className="text-gray-300 text-sm">{selectedIdea.mvpFeatures}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-2">Monetization</h3>
                      <p className="text-gray-300 text-sm">{selectedIdea.monetization}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Technical Implementation</h3>
                    <p className="text-gray-300 text-sm">{selectedIdea.technicalImplementation}</p>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-blue-400">Viability Analysis</h3>
                      <span className="text-blue-400 font-semibold">{selectedIdea.viabilityScore}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-white">Market Potential</p>
                        <p className="text-gray-300">{selectedIdea.marketPotential}</p>
                      </div>
                      <div>
                        <p className="font-medium text-white">Technical Feasibility</p>
                        <p className="text-gray-300">{selectedIdea.technicalFeasibility}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Supporting Evidence</h3>
                    <p className="text-gray-300 text-sm">{selectedIdea.supportingEvidence}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 