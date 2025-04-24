declare interface Account {
  accountName: string;
  accessToken: string;
  walletAddress: string;
}

declare interface Accounts {
  Axie: Account[];
}

declare interface ClaimQuestResponse {
  data: {
    verifyQuest: {
      title: string;
      status: string;
    };
  };
}

declare interface QuestReport {
  data: {
    userQuests: {
      quests: Array<{
        type: string;
        title: string;
        status: string;
      }>;
    };
  };
}

declare interface Variant {
  id: string;
  labels: string[];
  __typename: string;
}

interface Quest {
  type: string;
  title: string;
  status: string;
  tier: string;
  category: string;
  slot: number;
  rerollTimes: {
    current: number;
    maximum: number;
  };
  points: number;
  mAxsReward: number;
  board: string;
  iconUrl: string;
  variant: {
    id: string;
    labels: Record<string, string>;
  };
  startedAt: string | null;
  expiredAt: string | null;
  description: string;
}

declare interface UserQuests {
  quests: Quest[];
  __typename: string;
}

interface QuestResponse {
  data: {
    initPremierQuests: Quest[];
  };
}

declare interface GraphQLResponse {
  data: {
    userQuests: UserQuests;
    initPremierQuests: Quest[];
  };
  errors?: Array<{ message: string }>;
}
