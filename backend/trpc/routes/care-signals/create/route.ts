import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { supabaseAdmin } from '../../../../config/supabase';

const createSchema = z.object({
  category: z.enum(['emergency', 'health', 'emotional', 'practical', 'social']),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().optional(),
});

export const createCareSignalProcedure = protectedProcedure
  .input(createSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const userId = ctx.user.userId;
      
      const { data: signal, error } = await supabaseAdmin
        .from('care_signals')
        .insert({
          user_id: userId,
          category: input.category,
          title: input.title,
          description: input.description,
          urgency: input.urgency,
          location: input.location,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create care signal');
      }

      return {
        success: true,
        signal: {
          id: signal.id,
          category: signal.category,
          title: signal.title,
          description: signal.description,
          urgency: signal.urgency,
          location: signal.location,
          createdAt: signal.created_at,
        },
      };
    } catch (error) {
      console.error('Error creating care signal:', error);
      throw error;
    }
  });