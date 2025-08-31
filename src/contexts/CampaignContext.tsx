import React, { createContext, useState, useContext, useEffect } from 'react';
import { Campaign, MockCampaign } from '../types/Campaign';
import {createWalletClient,createPublicClient,http,custom, parseEther} from 'viem'
import { sepolia } from 'viem/chains';
import { FundedABI, FundedAddress } from './Fundedconfig';
import {useWallet} from './WalletContext';


const FundedPublicClient = createPublicClient({
  chain: sepolia,
  transport:http()
})

const FundedWalletClient = createWalletClient({
  chain:sepolia,
  transport: custom(window.ethereum)
})



interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: MockCampaign) => void;
  getCampaign: (id: string) => Campaign | undefined;
  contributeToCampaign: (id: string, amount: number, address: string) => void;
  userCampaigns: (address: string) => Campaign[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// Sample data for initial campaigns
const initialCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Revolutionary Clean Energy Solution',
    description: 'We are developing a new clean energy technology that can generate electricity at half the cost of traditional methods with zero emissions.',
    longDescription: 'Our team of engineers and scientists has been working on a breakthrough technology that harnesses ambient thermal energy to generate electricity with minimal environmental impact. This innovation could revolutionize how we power homes and businesses across the globe.\\n\\nThe funds raised will be used to build and test a full-scale prototype, conduct necessary certifications, and prepare for initial production runs. We aim to make this technology available to communities that need affordable, clean energy the most.',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    creatorName: 'EcoTech Innovations',
    goalAmount: 10,
    currentAmount: 2.3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    category: 'Technology',
    contributors: [
      { address: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 0.3 },
      { address: '0x7890abcdef1234567890abcdef1234567890abcd', amount: 0.4 },
      { address: '0x567890abcdef1234567890abcdef1234567890ab', amount: 1.2 }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  // {
  //   id: '2',
  //   title: 'Community Garden Initiative',
  //   description: 'Help us transform vacant lots in our neighborhood into productive community gardens that provide fresh food and green spaces.',
  //   longDescription: 'The Community Garden Initiative aims to convert five vacant lots in underprivileged neighborhoods into vibrant community gardens. These spaces will serve as sources of fresh produce for local residents, educational hubs for schools, and community gathering spots.\\n\\nYour contributions will help us secure land use permissions, purchase soil, seeds, and tools, and build basic infrastructure such as raised beds, water systems, and pathways. We\'ll also implement educational programs for local schools and community groups.\\n\\nWith your support, we can create sustainable green spaces that promote food security, environmental education, and community cohesion.',
  //   creator: '0x2345678901abcdef2345678901abcdef23456789',
  //   creatorName: 'Green Futures Collective',
  //   goalAmount: 2010,
  //   currentAmount: 94.23,
  //   deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
  //   imageUrl: 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg',
  //   category: 'Environment',
  //   contributors: [
  //     { address: '0xcdef1234567890abcdef1234567890abcdef1234', amount: 1.2 },
  //     { address: '0x4567890abcdef1234567890abcdef1234567890a', amount: 2 },
  //     { address: '0xef1234567890abcdef1234567890abcdef123456', amount: 2.3 }
  //   ],
  //   createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  // },
  {
    id: '3',
    title: 'Accessible Education Platform',
    description: 'We\'re building a free online learning platform that makes quality education accessible to everyone, especially in underserved regions.',
    longDescription: 'Our Accessible Education Platform is designed to break down barriers to education by providing high-quality learning materials to anyone with internet access. We focus particularly on reaching students in underserved regions where educational resources are limited.\\n\\nThe platform will feature interactive courses in core subjects, developed by qualified educators and optimized for low-bandwidth environments. Courses will be available in multiple languages and accommodate various learning styles and accessibility needs.\\n\\nFunds raised will support content development, platform engineering, translation services, and offline access capabilities. With your help, we can democratize education and empower learners worldwide.',
    creator: '0x3456789012abcdef3456789012abcdef34567890',
    creatorName: 'EduAccess Foundation',
    goalAmount: 1000,
    currentAmount: 35,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
    imageUrl: 'https://res.cloudinary.com/dfxpx7go7/image/upload/v1751029389/download_4_lfb8gn.jpg',
    category: 'Education',
    contributors: [
      { address: '0xf1234567890abcdef1234567890abcdef1234567', amount: 0.2 },
      { address: '0x567890abcdef1234567890abcdef1234567890ab', amount: 2.1 },
      { address: '0x90abcdef1234567890abcdef1234567890abcdef', amount: 1.9}
    ],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: 'Innovative Medical Device for Rural Areas',
    description: 'Our portable diagnostic device can help healthcare workers in remote areas quickly diagnose common illnesses without lab infrastructure.',
    longDescription: 'We\'ve developed a portable, low-cost diagnostic device specifically designed for healthcare providers in rural and remote areas where laboratory infrastructure is limited or nonexistent. This innovation can diagnose common ailments through simple tests that provide rapid results, allowing for faster treatment decisions and better patient outcomes.\\n\\nThe device uses minimal power, can be charged via solar energy, and is ruggedized for harsh conditions. It comes with an intuitive interface that requires minimal training to operate effectively.\\n\\nFunding will help us finalize the prototype, conduct field testing in partnership with rural healthcare providers, obtain necessary regulatory approvals, and begin initial production. Our goal is to make this life-saving technology available to the communities that need it most.',
    creator: '0x4567890123abcdef4567890123abcdef45678901',
    creatorName: 'MedTech for All',
    goalAmount: 3000000,
    currentAmount: 2240,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    imageUrl: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg',
    category: 'Healthcare',
    contributors: [
      { address: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 1000 },
      { address: '0x0abcdef1234567890abcdef1234567890abcdef1', amount: 1240 }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    // Try to get campaigns from localStorage
    const savedCampaigns = localStorage.getItem('campaigns');
    return savedCampaigns ? JSON.parse(savedCampaigns) : initialCampaigns;
  });
  const [totalContributions,settTotalContributions] = useState<string>('')

  const {account:activeAccount}  = useWallet()

  // Save campaigns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('campaigns', JSON.stringify(campaigns));

    const Initials = async () => {

      let retrievedCampaigns;
      
      const preliminaries = await FundedPublicClient.readContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName:"Preliminaries"
      })
    console.log("Theese are the preliminaries:", preliminaries)
     
    for(let c = 0; c < preliminaries[3].length; c++){
          const index = preliminaries[3][c];

           const retCampaign = await FundedPublicClient.readContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName:"getCampaign",
          args:[index]
      })
       
      console.log('The campaign:', retCampaign)

    }
      console.log("Theese are the campaigns from the contract:",retrievedCampaigns)

    }

      Initials()

  }, [campaigns]);

  const addCampaign = (campaign: MockCampaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      currentAmount: 0,
      contributors: [],
      createdAt: new Date().toISOString()
    };
    
    setCampaigns([...campaigns, newCampaign]);
  };

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const contributeToCampaign = async (id: string, amount: number, address: string) => {

        const hash = await FundedWalletClient.writeContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName: "contribute",
          args:[id],
          account:address,
          value: parseEther(amount)
        })


    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {

      
        // Check if this contributor already exists
        const existingContributorIndex = campaign.contributors.findIndex(
          c => c.address === address
        );
        
        let newContributors;
        if (existingContributorIndex >= 0) {
          newContributors = [...campaign.contributors];
          newContributors[existingContributorIndex] = {
            ...newContributors[existingContributorIndex],
            amount: newContributors[existingContributorIndex].amount + amount
          };
        } else {
          newContributors = [...campaign.contributors, { address, amount }];
        }
        
        return {
          ...campaign,
          currentAmount: campaign.currentAmount + amount,
          contributors: newContributors
        };
      }
      return campaign;
    }));
  };

  const userCampaigns = (address: string) => {
    return campaigns.filter(campaign => campaign.creator === address);
  };

  return (
    <CampaignContext.Provider value={{ 
      campaigns, 
      addCampaign, 
      getCampaign,
      contributeToCampaign,
      userCampaigns
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};