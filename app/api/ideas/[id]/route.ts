/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { IdeaService } from '../service'
import { z } from 'zod'

// Input validation schema
const updateIdeaSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idea = await IdeaService.getIdeaById(params.id)
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(idea)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const validatedData = updateIdeaSchema.parse(body)
    const updatedIdea = await IdeaService.updateIdea(params.id, validatedData)
    return NextResponse.json(updatedIdea)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Deleting idea with ID:', params.id);
    await IdeaService.deleteIdea(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 