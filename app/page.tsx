import { TranscriptAnalyzer } from '@/components/TranscriptAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          YouTube Podcast Business Idea Analyzer
        </h1>
        <p className="text-gray-300 mb-8 text-center">
          Paste a YouTube podcast URL to analyze the content and generate business ideas using GPT-4
        </p>
        <TranscriptAnalyzer />
      </div>
    </main>
  );
}
