import { prisma } from '@/utils/db'
import { Prisma } from '@prisma/client'

export type CreateIdeaInput = Omit<Prisma.IdeaCreateInput, 'createdAt' | 'updatedAt'>
export type UpdateIdeaInput = Partial<Omit<Prisma.IdeaUpdateInput, 'createdAt' | 'updatedAt'>>

export class IdeaService {
  static async createIdea(data: CreateIdeaInput) {
    try {
      // Ensure metadata is properly formatted as JSON
      const formattedData = {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null
      };

      console.log('Creating idea with data:', formattedData);
      
      const result = await prisma.idea.create({ 
        data: formattedData
      });

      console.log('Created idea result:', result);
      return result;
    } catch (error) {
      console.error('Detailed error creating idea:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.code} - ${error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to create idea');
    }
  }

  static async getIdeas(userId: string) {
    try {
      return await prisma.idea.findMany({
        where: { 
          userId,
          isArchived: false
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching ideas:', error)
      throw new Error('Failed to fetch ideas')
    }
  }

  static async getIdeaById(id: string) {
    try {
      return await prisma.idea.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error('Error fetching idea:', error)
      throw new Error('Failed to fetch idea')
    }
  }

  static async updateIdea(id: string, data: UpdateIdeaInput) {
    try {
      return await prisma.idea.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating idea:', error)
      throw new Error('Failed to update idea')
    }
  }

  static async deleteIdea(id: string) {
    try {
      return await prisma.idea.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.code} - ${error.message}`);
      }
      throw new Error('Failed to delete idea');
    }
  }

  static async likeIdea(id: string) {
    try {
      // First check if the idea exists
      const idea = await prisma.idea.findUnique({
        where: { id }
      });

      if (!idea) {
        throw new Error('Idea not found');
      }

      return await prisma.idea.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
    } catch (error) {
      console.error('Error liking idea:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.code} - ${error.message}`);
      }
      throw error;
    }
  }
} 