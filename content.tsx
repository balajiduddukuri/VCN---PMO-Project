
import { DocSection } from './types';

export const UI_TEXT = {
  dashboard: {
    aiTitle: "VCN Protocol Intelligence Analysis.",
    aiDesc: "Our Strategic AI correlates global network health with localized performance vectors to recommend protocol optimizations and resource allocations.",
    ledgerTitle: "Network Trust Ledger",
    ledgerDesc: "Real-time reputation data secured by the VCN consensus protocol.",
  },
  experts: {
    title: "Governance Advisory Board",
    subtitle: "Strategic oversight for the VCN global protocol",
  },
  clients: {
    title: "Strategic Client Partners",
    subtitle: "Enterprises leveraging the VCN professional ecosystem",
  },
  docs: {
    title: "VCN Knowledge Hub",
    subtitle: "The definitive source for VCN protocol standards and organizational architecture.",
  },
  opportunities: {
    title: "Network Marketplace",
    subtitle: "Apply your reputation to high-impact strategic initiatives.",
  }
};

export const DOC_CATEGORIES = [
  { id: 'concepts', title: 'Core Concepts', icon: 'Sparkles' },
  { id: 'architecture', title: 'Architecture', icon: 'Layers' },
  { id: 'protocols', title: 'Protocols', icon: 'ShieldCheck' },
  { id: 'glossary', title: 'Glossary', icon: 'Book' },
];

export const DOC_SECTIONS: (DocSection & { category: string })[] = [
  {
    id: 'vcn-vision',
    category: 'concepts',
    title: 'Value Creation Networks',
    content: `A Value Creation Network (VCN) is a decentralized professional infrastructure where value is tracked through contributions rather than hierarchy. 
    
    The transition from PMO to VCN marks a shift from administrative oversight to value generation. Nodes in the network are self-sovereign contributors who own their reputation and data.
    
    Core Tenets:
    - Transparency: All value transfers are visible on the ledger.
    - Meritocracy: Opportunities are routed based on verified mastery.
    - Interoperability: Professional identity is portable across enterprise units.`
  },
  {
    id: 'trust-mechanics',
    category: 'concepts',
    title: 'Trust & Consensus',
    content: `In a VCN, trust is a dynamic metric. The network achieves consensus on "Value" through a peer-verification process. 
    
    Endorsements act as votes in the system. To prevent sybil attacks and collusion, the VCN Protocol uses an 'Expert Weighting' mechanism where endorsements from nodes with high domain authority carry 2x more weight than base-level nodes.`
  },
  {
    id: 'layer-1',
    category: 'architecture',
    title: 'Layer 1: Identity',
    content: `The Identity Layer manages self-sovereign professional credentials.
    
    Participants are modeled as 'Nodes' with unique cryptographic signatures. These signatures are used to sign 'Artifacts' (deliverables). This ensures that authorship is immutable and non-repudiable. Identity is further enriched by 'Mastery Badges'—verifiable credentials that certify specific technical or strategic skills.`
  },
  {
    id: 'layer-2',
    category: 'architecture',
    title: 'Layer 2: The Ledger',
    content: `The Ledger Layer is a tamper-proof record of all verified artifacts.
    
    Every time a Roadmap is completed, a Sync is conducted, or a Mentor session is finished, an entry is added to the ledger. This ledger provides the historical data required to calculate the Social Capital score in real-time.`
  },
  {
    id: 'consensus-algorithm',
    category: 'protocols',
    title: 'The Reputation Formula',
    content: `Social Capital (R) is calculated using a tripartite weighted sum:
    
    R = (0.5 * P) + (0.3 * O) + (0.2 * I)
    
    - P (Peer Endorsements): Calculated via weighted social graph analysis.
    - O (Outcome Delivery): Points awarded for verified final artifacts.
    - I (Initiative Velocity): Frequent activity and repeat collaboration requests.
    
    Protocol v2.4 introduces 'Decay Logic'—reputation decreases by 5% every 30 days of inactivity to ensure current authority reflects active mastery.`
  },
  {
    id: 'verification-protocol',
    category: 'protocols',
    title: 'Verification Logic',
    content: `Artifacts must pass the 2-Peer Verification Protocol before contributing to Social Capital.
    
    1. Submission: Node signs and uploads artifact.
    2. Random Selection: The protocol selects 2 peer reviewers with relevant badges.
    3. Consensus: If both reviewers verify, the artifact is committed to the ledger. If they disagree, an Advisor node is called for arbitration.`
  },
  {
    id: 'glossary-terms',
    category: 'glossary',
    title: 'VCN Terms A-Z',
    content: `Artifact: A discrete, tangible unit of professional work verified for impact.
    
    Consensus Protocol: The logic used to validate contributions across the network.
    
    Decay Factor: The rate at which reputation points expire to maintain network vitality.
    
    Mastery Badge: A verifiable credential certifying specialized professional capability.
    
    Node: Any individual participant or unit within the VCN ecosystem.
    
    Social Capital: A non-transferable score representing total verified impact and trust.`
  }
];
