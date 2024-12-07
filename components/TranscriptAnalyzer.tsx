'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="col-span-2 space-y-6">
            {businessIdeas.map((idea, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-lg border border-gray-700 relative">
                <h2 className="text-xl font-semibold text-white mb-6">{idea.ideaName}</h2>
                
                <div className="space-y-6 text-sm text-gray-300">
                  <div>
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <p>{idea.description}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Target Market</h3>
                    <p>{idea.targetMarket}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">MVP Features</h3>
                    <p>{idea.mvpFeatures}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Monetization</h3>
                    <p>{idea.monetization}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Technical Implementation</h3>
                    <p>{idea.technicalImplementation}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Key Insights</h3>
                    <p>{idea.keyInsights}</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">Viability Analysis</h3>
                    <div className="space-y-2">
                      <p>Score: {idea.viabilityScore}</p>
                      <p>Market Potential: {idea.marketPotential}</p>
                      <p>Technical Feasibility: {idea.technicalFeasibility}</p>
                      <p>Resource Requirements: {idea.resourceRequirements}</p>
                      <p>Competition: {idea.competition}</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Supporting Evidence</h3>
                    <p className="italic">{idea.supportingEvidence}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="sticky top-8">
              <div className="p-6 bg-white/5 rounded-lg border border-gray-700">
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={analysis.thumbnailUrl}
                    alt={analysis.videoTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{analysis.videoTitle}</h2>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="font-medium">{analysis.channelTitle}</p>
                  <p>{new Date(analysis.publishedAt).toLocaleDateString()}</p>
                  <p className="line-clamp-3">{analysis.videoDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 