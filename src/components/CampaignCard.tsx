import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Campaign } from '../types/Campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const progressPercentage = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);
  const daysLeft = Math.max(
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0
  );
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
          {campaign.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{campaign.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{campaign.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-900">{campaign.currentAmount.toLocaleString()} LSK  </span>
            <span className="text-gray-500">raised of {campaign.goalAmount.toLocaleString()} LSK</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div>{campaign.contributors.length} contributor{campaign.contributors.length !== 1 ? 's' : ''}</div>
          <div>{daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Campaign ended'}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created {formatDistanceToNow(new Date(campaign.createdAt))} ago
          </div>
          <Link 
            to={`/campaign/${campaign.id}`}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors duration-300"
          >
            View Campaign
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;