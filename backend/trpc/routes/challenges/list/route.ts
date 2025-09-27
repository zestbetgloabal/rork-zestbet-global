import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listChallengesSchema = z.object({
  type: z.enum(["individual", "team"]).optional(),
  status: z.enum(["active", "completed", "upcoming"]).optional(),
  category: z.enum(["fitness", "learning", "habit", "creative", "social", "other"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export default publicProcedure
  .input(listChallengesSchema)
  .query(async ({ input }) => {
    const { type, status, limit, offset } = input;
    
    // TODO: Implement actual challenge listing logic
    
    // Mock data - compatible with frontend Challenge type
    const mockChallenges = [
      {
        id: "1",
        title: "30 Tage Fitness Challenge",
        description: "Jeden Tag 30 Minuten Sport",
        creator: "user1",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: "fitness",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        status: "active",
        participants: [
          {
            id: "p1",
            userId: "user1",
            username: "John Doe",
            joinedAt: new Date(),
            score: 85,
            rank: 1
          },
          {
            id: "p2",
            userId: "user2",
            username: "Jane Smith",
            joinedAt: new Date(),
            score: 72,
            rank: 2
          }
        ],
        type: "individual",
        visibility: "public",
        hasPool: false,
        teams: []
      },
      {
        id: "2",
        title: "Team Coding Challenge",
        description: "Build an app in 7 days",
        creator: "user2",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: "learning",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        status: "active",
        participants: [
          {
            id: "p3",
            userId: "user3",
            username: "Bob Wilson",
            joinedAt: new Date(),
            score: 0,
            teamId: "team1"
          },
          {
            id: "p4",
            userId: "user4",
            username: "Alice Brown",
            joinedAt: new Date(),
            score: 0,
            teamId: "team1"
          }
        ],
        type: "team",
        visibility: "public",
        hasPool: true,
        pool: {
          id: "pool1",
          challengeId: "2",
          totalAmount: 500,
          minContribution: 10,
          maxContribution: 100,
          distributionStrategy: "standard",
          contributions: [
            {
              id: "c1",
              userId: "user3",
              username: "Bob Wilson",
              amount: 50,
              timestamp: new Date()
            }
          ],
          isDistributed: false
        },
        teams: [
          {
            id: "team1",
            name: "Code Warriors",
            challengeId: "2",
            members: [
              {
                id: "p3",
                userId: "user3",
                username: "Bob Wilson",
                joinedAt: new Date(),
                score: 0,
                teamId: "team1"
              },
              {
                id: "p4",
                userId: "user4",
                username: "Alice Brown",
                joinedAt: new Date(),
                score: 0,
                teamId: "team1"
              }
            ],
            score: 0,
            rank: 1
          }
        ]
      }
    ];
    
    // Apply filters
    let filteredChallenges = mockChallenges;
    if (type) {
      filteredChallenges = filteredChallenges.filter(challenge => challenge.type === type);
    }
    if (status) {
      filteredChallenges = filteredChallenges.filter(challenge => challenge.status === status);
    }
    if (input.category) {
      filteredChallenges = filteredChallenges.filter(challenge => challenge.category === input.category);
    }
    
    // Apply pagination
    const paginatedChallenges = filteredChallenges.slice(offset, offset + limit);
    
    return {
      challenges: paginatedChallenges,
      total: filteredChallenges.length,
      hasMore: offset + limit < filteredChallenges.length,
    };
  });