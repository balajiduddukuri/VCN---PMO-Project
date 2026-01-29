
import { User, Artifact, NetworkMilestone, KPIMetrics, GovernancePolicy, Deliverable, AdvisorReview, Opportunity, Client, ClientFeedback } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Sarah Jenkins', role: 'PM', reputation: 88, badges: ['Agile Expert', 'Top Collaborator'], avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'Michael Chen', role: 'DM', reputation: 72, badges: ['Delivery Master'], avatar: 'https://i.pravatar.cc/150?u=michael' },
  { id: '3', name: 'Elena Rodriguez', role: 'PM', reputation: 95, badges: ['Strategic Vision', 'Peer Mentor'], avatar: 'https://i.pravatar.cc/150?u=elena' },
  { id: '4', name: 'David Smith', role: 'DM', reputation: 64, badges: ['Efficiency Pro'], avatar: 'https://i.pravatar.cc/150?u=david' },
];

export const INITIAL_ARTIFACTS: Artifact[] = [
  { id: 'a1', userId: '1', title: 'Q3 Delivery Roadmap', type: 'Deliverable', timestamp: '2024-05-15', verified: true, scoreContribution: 10 },
  { id: 'a2', userId: '3', title: 'Cross-Team Sync Framework', type: 'Outcome', timestamp: '2024-05-16', verified: true, scoreContribution: 15 },
  { id: 'a3', userId: '1', title: 'Mentorship on Jira Automations', type: 'Endorsement', timestamp: '2024-05-17', verified: false, scoreContribution: 5 },
  { id: 'a4', userId: '2', title: 'Vendor SLA Negotiation', type: 'Deliverable', timestamp: '2024-05-18', verified: true, scoreContribution: 10 },
];

export const NETWORK_MILESTONES: NetworkMilestone[] = [
  { id: 'm1', title: 'Protocol Genesis', description: 'Core consensus and weighting mechanisms established.', owner: 'Network Council', progress: 100, status: 'Live' },
  { id: 'm2', title: 'VCN Expansion v2', description: 'Onboarding next 500 PMO specialists globally.', owner: 'Operations Lead', progress: 45, status: 'In Development' },
  { id: 'm3', title: 'Reputation Portability', description: 'W3C Verifiable Credential export system.', owner: 'Engineering', progress: 20, status: 'In Development' },
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'Lead: Global Strategy Sync', rewardRep: 50, requiredBadges: ['Strategic Vision'], description: 'High-visibility role managing the Q4 global alignment workshop.', deadline: '2024-12-01' },
  { id: 'o2', title: 'Review: AI Integration Spec', rewardRep: 25, requiredBadges: ['Agile Expert'], description: 'Technical review of the new Jira integration protocols.', deadline: '2024-11-15' },
  { id: 'o3', title: 'Peer Mentor: Junior DM Cohort', rewardRep: 40, requiredBadges: ['Peer Mentor'], description: 'Provide 1-on-1 guidance for incoming Delivery Managers.', deadline: 'Ongoing' },
];

export const GOVERNANCE_POLICIES: GovernancePolicy[] = [
  { id: 'g1', title: 'Reputation Decay Factor', impact: 'Prevents stagnant authority; requires ongoing verified contributions.', governanceLevel: 'Global', status: 'Active' },
  { id: 'g2', title: 'Endorsement Fraud Shield', impact: 'Algorithmic detection of mutual endorsement rings.', governanceLevel: 'Global', status: 'Active' },
  { id: 'g3', title: 'Local Unit Multipliers', impact: 'Adjust weighting based on specific business unit complexity.', governanceLevel: 'Unit', status: 'Under Review' },
];

export const ADVISOR_REVIEWS: AdvisorReview[] = [
  { id: 'e1', name: 'Dr. Aris Thorne', specialty: 'Network Theory', feedback: 'Network density is optimal for expansion to the 500-node tier.', fullBio: 'Dr. Thorne specializes in social graph mechanics and professional reputation systems.', rating: 4.8, priority: 'Visionary', avatar: 'https://i.pravatar.cc/150?u=e1' },
  { id: 'e4', name: 'Soren Kierk', specialty: 'Behavioral Science', feedback: 'The micro-incentive loop is now self-sustaining.', fullBio: 'Soren works on psychological reinforcement in digital professional ecosystems.', rating: 4.9, priority: 'Critical', avatar: 'https://i.pravatar.cc/150?u=e4' },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Global Tech Corp', logo: 'https://logo.clearbit.com/google.com', industry: 'Software & Cloud', status: 'Strategic Partner', location: 'San Francisco, CA' },
  { id: 'c2', name: 'FinEdge Ltd', logo: 'https://logo.clearbit.com/stripe.com', industry: 'Financial Services', status: 'Active', location: 'London, UK' },
];

export const CLIENT_FEEDBACK: ClientFeedback[] = [
  { id: 'f1', clientId: 'c1', author: 'Jonathan Reeves', role: 'Head of Engineering', content: 'VCN visibility is now a core part of our vendor delivery validation.', rating: 4.8, date: '2024-10-10', sentiment: 'Positive' },
];

export const MOCK_METRICS: KPIMetrics = {
  verifiedContributors: 1542,
  collaborationLift: 38,
  partnerNPS: 9.1,
  totalArtifacts: 4892,
  socialCapitalScore: 12450,
};

export const COLLABORATION_TREND = [
  { day: 'Mon', count: 145 },
  { day: 'Tue', count: 188 },
  { day: 'Wed', count: 215 },
  { day: 'Thu', count: 202 },
  { day: 'Fri', count: 230 },
  { day: 'Sat', count: 45 },
  { day: 'Sun', count: 22 },
];
