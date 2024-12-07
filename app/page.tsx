import { TranscriptAnalyzer } from '@/components/TranscriptAnalyzer';
import { SavedIdeas } from '@/components/SavedIdeas';
import { SidebarVideoDetails } from '@/components/SidebarVideoDetails';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          YouTube Podcast Business Idea Analyzer
        </h1>
        <p className="text-gray-300 mb-8 text-center">
          Paste a YouTube podcast URL to analyze the content and generate business ideas using GPT-4
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="sticky top-4">
              <h2 className="text-2xl font-semibold text-white mb-4">Generate New Ideas</h2>
              <TranscriptAnalyzer />
            </div>
          </div>
          <div className="lg:w-96 relative">
            <div className="sticky top-4 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Video Details</h2>
                <SidebarVideoDetails />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Saved Ideas</h2>
                <SavedIdeas />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
