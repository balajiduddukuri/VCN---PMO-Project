
export enum BadgeType {
  MASTERY = 'MASTERY',
  REPUTATION = 'REPUTATION',
  RECOGNITION = 'RECOGNITION',
  COLLABORATION = 'COLLABORATION'
}

export interface User {
  id: string;
  name: string;
  role: 'PM' | 'DM' | 'LEAD' | 'CDO';
  reputation: number;
  badges: string[];
  avatar: string;
}

export interface Artifact {
  id: string;
  userId: string;
  title: string;
  type: 'Deliverable' | 'Outcome' | 'Endorsement';
  timestamp: string;
  verified: boolean;
  scoreContribution: number;
}

export interface NetworkMilestone {
  id: string;
  title: string;
  description: string;
  owner: string;
  progress: number;
  status: 'In Development' | 'Live' | 'Archived';
}

export interface KPIMetrics {
  verifiedContributors: number;
  collaborationLift: number;
  partnerNPS: number;
  totalArtifacts: number;
  socialCapitalScore: number;
}

export interface GovernancePolicy {
  id: string;
  title: string;
  impact: string;
  governanceLevel: 'Global' | 'Unit' | 'Local';
  status: 'Active' | 'Under Review' | 'Draft';
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Draft' | 'Review' | 'Final';
  link?: string;
}

export interface AdvisorReview {
  id: string;
  name: string;
  specialty: string;
  feedback: string;
  fullBio: string;
  rating: number;
  priority: 'Critical' | 'Optimization' | 'Visionary';
  avatar: string;
}

export interface Opportunity {
  id: string;
  title: string;
  rewardRep: number;
  requiredBadges: string[];
  description: string;
  deadline: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  industry: string;
  status: 'Active' | 'Strategic Partner';
  location: string;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  sentiment: 'Positive' | 'Neutral' | 'Mixed';
}
