import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { AssemblyAI } from 'assemblyai';

const youtube = google.youtube('v3');
const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN
});
const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY ?? ''
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Extract video ID from URL
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video details using YouTube Data API
    const videoResponse = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      id: [videoId]
    });

    if (!videoResponse.data.items?.length) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = videoResponse.data.items[0];
    const videoDescription = video.snippet?.description || '';
    const videoTitle = video.snippet?.title || '';
    const channelTitle = video.snippet?.channelTitle || '';
    const thumbnailUrl = video.snippet?.thumbnails?.maxres?.url || 
                        video.snippet?.thumbnails?.high?.url ||
                        video.snippet?.thumbnails?.medium?.url || '';
    const publishedAt = video.snippet?.publishedAt || '';

    // Get video audio URL
    const audioUrl = `https://www.youtube.com/watch?v=${videoId}` || `https://youtu.be/${videoId}`;

    // Get transcript using AssemblyAI
    let transcript;
    try {
      const transcriptResponse = await assemblyai.transcripts.transcribe({
        audio_url: audioUrl,
        language_code: 'en'
      });
      transcript = transcriptResponse.text;
    } catch (transcriptError) {
      console.error('Transcript error:', transcriptError);
      return NextResponse.json(
        { error: 'Could not transcribe video audio. Please try again.' },
        { status: 400 }
      );
    }

    // Create a comprehensive context from video details and transcript
    const videoContext = `
Title: ${videoTitle}
Description: ${videoDescription}

Transcript:
${transcript}
`;

    // Analyze with Github GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business analyst and startup expert. Analyze the following YouTube video transcript and present your analysis in a structured format. For each business idea, use the following exact format with these exact section titles:

          [START_IDEA]
          IDEA_NAME: Name of the Business Idea
          
          DESCRIPTION: A clear description of the idea as mentioned in the video
          
          TARGET_MARKET: Analysis of the target audience based on the discussion
          
          MVP_FEATURES: List of key features needed for the minimum viable product
          
          MONETIZATION: Strategies discussed or implied in the video
          
          TECHNICAL_IMPLEMENTATION: Overview of technical requirements and approach
          
          KEY_INSIGHTS: Specific tips and insights mentioned in the video
          
          VIABILITY_SCORE: X/10
          MARKET_POTENTIAL: Assessment
          TECHNICAL_FEASIBILITY: Assessment
          RESOURCE_REQUIREMENTS: Assessment
          COMPETITION: Analysis if mentioned
          
          SUPPORTING_EVIDENCE: Relevant quotes from the transcript
          [END_IDEA]

          Repeat this exact structure for each business idea identified. Make sure to keep the section titles exactly as shown above.`
        },
        {
          role: "user",
          content: videoContext
        }
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 4000,
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
      videoTitle,
      videoDescription,
      channelTitle,
      thumbnailUrl,
      publishedAt
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze video' },
      { status: 500 }
    );
  }
} 