/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { IdeaService } from './service'
import { z } from 'zod'

// Input validation schema
const metadataSchema = z.object({
  mvpFeatures: z.string().optional(),
  monetization: z.string().optional(),
  technicalImplementation: z.string().optional(),
  keyInsights: z.string().optional(),
  viabilityScore: z.string().optional(),
  marketPotential: z.string().optional(),
  technicalFeasibility: z.string().optional(),
  resourceRequirements: z.string().optional(),
  competition: z.string().optional(),
  supportingEvidence: z.string().optional()
}).optional()

const createIdeaSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  tags: z.array(z.string()),
  category: z.string().optional(),
  userId: z.string(),
  metadata: metadataSchema
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received request body:', body);
    
    const validatedData = createIdeaSchema.parse(body)
    console.log('Validated data:', validatedData);
    
    const idea = await IdeaService.createIdea(validatedData)
    console.log('Created idea:', idea);
    
    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/ideas:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation Error',
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    const ideas = await IdeaService.getIdeas(userId)
    return NextResponse.json(ideas)
  } catch (error) {
    console.error('Error in GET /api/ideas:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 