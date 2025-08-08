import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listChallengesSchema = z.object({
  type: z.enum(["fitness", "learning", "habit", "creative", "social"]).optional(),
  status: z.enum(["active", "completed", "upcoming"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export default publicProcedure
  .input(listChallengesSchema)
  .query(async ({ input }) => {
    const { type, status, limit, offset } = input;
    
    // TODO: Implement actual challenge listing logic
    
    // Mock data
    const mockChallenges = [
      {
        id: "1",
        title: "30 Tage Fitness Challenge",
        description: "Jeden Tag 30 Minuten Sport",
        type: "fitness",
        duration: 30,
        reward: 100,
        isPublic: true,
        maxParticipants: 50,
        participants: ["user1", "user2", "user3"],
        createdBy: "user1",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Lerne eine neue Sprache",
        description: "Täglich 15 Minuten Sprachtraining",
        type: "learning",
        duration: 60,
        reward: 200,
        isPublic: true,
        maxParticipants: 30,
        participants: ["user2", "user4"],
        createdBy: "user2",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    ];
    
    // Apply filters
    let filteredChallenges = mockChallenges;
    if (type) {
      filteredChallenges = filteredChallenges.filter(challenge => challenge.type === type);
    }
    if (status) {
      filteredChallenges = filteredChallenges.filter(challenge => challenge.status === status);
    }
    
    // Apply pagination
    const paginatedChallenges = filteredChallenges.slice(offset, offset + limit);
    
    return {
      challenges: paginatedChallenges,
      total: filteredChallenges.length,
      hasMore: offset + limit < filteredChallenges.length,
    };
  });