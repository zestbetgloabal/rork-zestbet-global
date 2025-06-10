// Add this to your existing mockData.ts file if it doesn't already exist

import { Bet, SocialPost, Badge, Challenge, ChallengePool, ChallengeTeam, UserRank } from '@/types';

// Mock bets for development
export const mockBets: Bet[] = [
  {
    id: '1',
    title: 'Will Bitcoin reach $100K by end of 2023?',
    description: 'Betting on whether Bitcoin will reach $100,000 by December 31, 2023.',
    creator: 'crypto_enthusiast',
    likes: 245,
    participants: 78,
    totalPool: 5600,
    minBet: 10,
    maxBet: 1000,
    endDate: new Date(2023, 11, 31), // December 31, 2023
    category: 'crypto',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000',
    visibility: 'public'
  },
  {
    id: '2',
    title: 'Will it rain on New Year\'s Eve?',
    description: 'Betting on whether it will rain in New York City on December 31, 2023.',
    creator: 'weather_watcher',
    likes: 87,
    participants: 32,
    totalPool: 1200,
    minBet: 5,
    maxBet: 100,
    endDate: new Date(2023, 11, 31), // December 31, 2023
    category: 'weather',
    image: 'https://images.unsplash.com/photo-1514632595-4944383f2737?q=80&w=1000',
    visibility: 'public'
  },
  {
    id: '3',
    title: 'Private bet with friends',
    description: 'Who will win our annual poker tournament?',
    creator: 'poker_king',
    likes: 12,
    participants: 5,
    totalPool: 500,
    minBet: 50,
    maxBet: 200,
    endDate: new Date(2023, 6, 15), // July 15, 2023
    category: 'games',
    visibility: 'private',
    invitedFriends: ['john_doe', 'jane_smith', 'bob_jones']
  }
];

// Mock social posts for development
export const mockSocialPosts: SocialPost[] = [
  {
    id: '1',
    userId: 'user123',
    username: 'BettingPro',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000',
    content: 'Just won big on the Bitcoin bet! 🚀 #crypto #winning',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    likes: 42,
    comments: 7,
    shares: 3,
    tags: ['crypto', 'winning']
  },
  {
    id: '2',
    userId: 'user456',
    username: 'LuckyGuesser',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: 'Anyone want to join my private bet on the upcoming championship game? DM me for details!',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    likes: 18,
    comments: 5,
    shares: 1,
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000',
        thumbnail: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000'
      }
    ]
  },
  {
    id: '3',
    userId: 'user789',
    username: 'SportsFanatic',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000',
    content: 'Lost my bet on yesterday\'s game, but it was so close! Next time I\'ll get it right. #sports #betting',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    likes: 27,
    comments: 12,
    shares: 0,
    tags: ['sports', 'betting']
  }
];

// Mock badges for the rank-based badge system
export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Recruit',
    description: 'Just starting your betting journey',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 0,
    isTeamBadge: false
  },
  {
    id: '2',
    name: 'Soldier',
    description: 'You\'ve proven your commitment',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 500,
    isTeamBadge: false
  },
  {
    id: '3',
    name: 'Sergeant',
    description: 'A respected member of the betting community',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 2000,
    isTeamBadge: false
  },
  {
    id: '4',
    name: 'Captain',
    description: 'Your betting prowess is well-known',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    animationUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 10000,
    isTeamBadge: false
  },
  {
    id: '5',
    name: 'General',
    description: 'A legendary bettor with unmatched experience',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    animationUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 50000,
    isTeamBadge: false
  },
  // Team badges
  {
    id: '6',
    name: 'Squad',
    description: 'A team that\'s just getting started',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 0,
    isTeamBadge: true
  },
  {
    id: '7',
    name: 'Platoon',
    description: 'A team with some wins under their belt',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 5000,
    isTeamBadge: true
  },
  {
    id: '8',
    name: 'Battalion',
    description: 'A formidable team that others fear',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    animationUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
    requiredTokens: 25000,
    isTeamBadge: true
  }
];

// Mock user rank for the badge system
export const mockUserRank: UserRank = {
  id: '1',
  userId: 'user123',
  username: 'zest_user',
  currentBadge: mockBadges[1], // Soldier
  totalTokensEarned: 1200,
  tokensToNextBadge: 800, // 2000 - 1200 = 800 to reach Sergeant
  nextBadge: mockBadges[2], // Sergeant
  history: [
    {
      badgeId: '1',
      badgeName: 'Recruit',
      earnedAt: new Date(2023, 0, 15) // January 15, 2023
    },
    {
      badgeId: '2',
      badgeName: 'Soldier',
      earnedAt: new Date(2023, 3, 22) // April 22, 2023
    }
  ]
};

// Mock challenges for the betting pool system
export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Weekly Step Challenge',
    description: 'Who can take the most steps this week?',
    creator: 'fitness_guru',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000',
    status: 'active',
    participants: [
      {
        id: '1',
        userId: 'user123',
        username: 'zest_user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        score: 15000,
        rank: 2,
        contribution: 100
      },
      {
        id: '2',
        userId: 'user456',
        username: 'StepMaster',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        score: 18000,
        rank: 1,
        contribution: 200
      },
      {
        id: '3',
        userId: 'user789',
        username: 'WalkingDude',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
        joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        score: 12000,
        rank: 3,
        contribution: 50
      }
    ],
    type: 'individual',
    visibility: 'public',
    hasPool: true,
    pool: {
      id: '1',
      challengeId: '1',
      totalAmount: 350, // 100 + 200 + 50
      minContribution: 50,
      maxContribution: 500,
      distributionStrategy: 'standard',
      contributions: [
        {
          id: '1',
          userId: 'user123',
          username: 'zest_user',
          amount: 100,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: '2',
          userId: 'user456',
          username: 'StepMaster',
          amount: 200,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          id: '3',
          userId: 'user789',
          username: 'WalkingDude',
          amount: 50,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ],
      isDistributed: false
    }
  },
  {
    id: '2',
    title: 'Team Running Challenge',
    description: 'Which team can run the most kilometers this month?',
    creator: 'marathon_runner',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000',
    status: 'active',
    participants: [
      {
        id: '4',
        userId: 'user123',
        username: 'zest_user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        teamId: 'team1',
        contribution: 150
      },
      {
        id: '5',
        userId: 'user456',
        username: 'StepMaster',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        teamId: 'team1',
        contribution: 200
      },
      {
        id: '6',
        userId: 'user789',
        username: 'WalkingDude',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        teamId: 'team2',
        contribution: 100
      },
      {
        id: '7',
        userId: 'user101',
        username: 'RunForever',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        teamId: 'team2',
        contribution: 250
      }
    ],
    type: 'team',
    visibility: 'public',
    hasPool: true,
    pool: {
      id: '2',
      challengeId: '2',
      totalAmount: 700, // 150 + 200 + 100 + 250
      minContribution: 50,
      maxContribution: 500,
      distributionStrategy: 'custom',
      customDistribution: {
        firstPlace: 60, // 60% for first place team
        secondPlace: 20, // 20% for second place team
        participation: 10, // 10% distributed among all participants
        platform: 10 // 10% for the platform
      },
      contributions: [
        {
          id: '4',
          userId: 'user123',
          username: 'zest_user',
          amount: 150,
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
        },
        {
          id: '5',
          userId: 'user456',
          username: 'StepMaster',
          amount: 200,
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
        },
        {
          id: '6',
          userId: 'user789',
          username: 'WalkingDude',
          amount: 100,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
          id: '7',
          userId: 'user101',
          username: 'RunForever',
          amount: 250,
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        }
      ],
      isDistributed: false
    },
    teams: [
      {
        id: 'team1',
        name: 'Speed Demons',
        challengeId: '2',
        members: [
          {
            id: '4',
            userId: 'user123',
            username: 'zest_user',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
            teamId: 'team1',
            contribution: 150
          },
          {
            id: '5',
            userId: 'user456',
            username: 'StepMaster',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
            joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            teamId: 'team1',
            contribution: 200
          }
        ],
        score: 120, // kilometers
        rank: 1
      },
      {
        id: 'team2',
        name: 'Road Warriors',
        challengeId: '2',
        members: [
          {
            id: '6',
            userId: 'user789',
            username: 'WalkingDude',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            teamId: 'team2',
            contribution: 100
          },
          {
            id: '7',
            userId: 'user101',
            username: 'RunForever',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            teamId: 'team2',
            contribution: 250
          }
        ],
        score: 95, // kilometers
        rank: 2
      }
    ]
  }
];

// Add more mock data as needed for your app