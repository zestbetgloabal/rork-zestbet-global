// Add this to your existing mockData.ts file if it doesn't already exist

import { Bet, SocialPost, Badge, Challenge, ChallengePool, ChallengeTeam, UserRank, Mission, ImpactProject, LeaderboardEntry } from '@/types';

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

// Mock missions for development
export const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'First Bet',
    description: 'Place your first bet to get started',
    reward: 50,
    category: 'onboarding',
    difficulty: 'easy',
    status: 'open',
    progress: 0,
    maxProgress: 1
  },
  {
    id: '2',
    title: 'Social Butterfly',
    description: 'Share 3 bets on social media',
    reward: 100,
    category: 'social',
    difficulty: 'medium',
    status: 'open',
    progress: 1,
    maxProgress: 3
  },
  {
    id: '3',
    title: 'High Roller',
    description: 'Place a bet with at least 500 Zest',
    reward: 200,
    category: 'betting',
    difficulty: 'hard',
    status: 'open',
    progress: 0,
    maxProgress: 1
  },
  {
    id: '4',
    title: 'Community Builder',
    description: 'Invite 5 friends to join ZestBet',
    reward: 300,
    category: 'referral',
    difficulty: 'medium',
    status: 'open',
    progress: 2,
    maxProgress: 5
  },
  {
    id: '5',
    title: 'Prediction Master',
    description: 'Win 10 bets in a row',
    reward: 500,
    category: 'achievement',
    difficulty: 'hard',
    status: 'completed',
    progress: 10,
    maxProgress: 10
  }
];

// Mock impact projects for development
export const mockImpactProjects: ImpactProject[] = [
  {
    id: '1',
    title: 'Clean Water for Rural Communities',
    description: 'Providing clean drinking water access to remote villages in developing countries.',
    organization: 'Water for All Foundation',
    amount: 2500,
    goal: 10000,
    category: 'water',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000',
    featured: true,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Kenya, Africa',
    website: 'https://waterforall.org'
  },
  {
    id: '2',
    title: 'Education for Underprivileged Children',
    description: 'Supporting education programs for children in low-income communities.',
    organization: 'Education First Initiative',
    amount: 1800,
    goal: 5000,
    category: 'education',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=1000',
    featured: false,
    location: 'India',
    website: 'https://educationfirst.org'
  },
  {
    id: '3',
    title: 'Reforestation Project',
    description: 'Planting trees to combat climate change and restore natural habitats.',
    organization: 'Green Earth Alliance',
    amount: 3200,
    goal: 8000,
    category: 'environment',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000',
    featured: false,
    location: 'Brazil',
    website: 'https://greenearth.org'
  },
  {
    id: '4',
    title: 'Medical Supplies for Disaster Relief',
    description: 'Emergency medical aid for communities affected by natural disasters.',
    organization: 'Global Relief Network',
    amount: 4100,
    goal: 15000,
    category: 'healthcare',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1000',
    featured: false,
    location: 'Philippines',
    website: 'https://globalrelief.org'
  }
];

// Mock leaderboard for development
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'BetMaster',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000',
    score: 15420,
    rank: 1,
    change: 2,
    badge: mockBadges[4] // General
  },
  {
    id: '2',
    userId: 'user2',
    username: 'LuckyStreak',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1000',
    score: 12850,
    rank: 2,
    change: -1,
    badge: mockBadges[3] // Captain
  },
  {
    id: '3',
    userId: 'user3',
    username: 'SportsFanatic',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000',
    score: 11200,
    rank: 3,
    change: 1,
    badge: mockBadges[3] // Captain
  },
  {
    id: '4',
    userId: 'user4',
    username: 'PredictionPro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000',
    score: 9800,
    rank: 4,
    change: 0,
    badge: mockBadges[2] // Sergeant
  },
  {
    id: '5',
    userId: 'user5',
    username: 'GameChanger',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000',
    score: 8500,
    rank: 5,
    change: 3,
    badge: mockBadges[2] // Sergeant
  }
];

// Add more mock data as needed for your app