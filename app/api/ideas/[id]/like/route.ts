/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { IdeaService } from '../../service'
import { Prisma } from '@prisma/client'

type Context = {
  params: {
    id: string;
  };
};

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    if (!context.params.id) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    const updatedIdea = await IdeaService.likeIdea(context.params.id);
    
    if (!updatedIdea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error('Error in like endpoint:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.code}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}