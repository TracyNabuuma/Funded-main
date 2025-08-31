import React, { useState } from 'react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { createWalletClient, custom, parseEther } from 'viem';
import { liskSepolia } from 'viem/chains';
import { FundedABI, FundedAddress } from '../contexts/Fundedconfig';

interface ContributionFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ campaignId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {account: activeAccount} = useWallet();
  
  const { contributeToCampaign } = useCampaigns();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!activeAccount) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Execute actual blockchain transaction
    setIsProcessing(true);
    
    const executeTransaction = async () => {
      try {
        // Create wallet client for transaction
        const walletClient = createWalletClient({
          chain: liskSepolia,
          transport: custom(window.ethereum)
        });
        
        // Execute blockchain transaction
        const hash = await walletClient.writeContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName: "contribute",
          args: [campaignId],
          account: activeAccount,
          value: parseEther(amountValue.toString())
        });
        
        console.log('Transaction hash:', hash);
        
        contributeToCampaign(campaignId, amountValue, activeAccount);
        
        setIsProcessing(false);
        setIsSuccess(true);
        setAmount('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
          if (onSuccess) onSuccess();
        }, 3000);
        
      } catch (err) {
        setIsProcessing(false);
        setError('Transaction failed. Please try again.');
        console.error('Transaction error:', err);
      }
    };
    
    executeTransaction();
  };
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Support This Campaign</h3>
      
      {isSuccess ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
          <p className="font-medium">Thank you for your contribution!</p>
          <p className="text-sm mt-1">Your transaction has been processed successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (LSK)
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                name="amount"
                id="amount"
                disabled={isProcessing}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                aria-describedby="amount-currency"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 left-15 pl-15 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">LSK</span>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="mb-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">5% platform fee</span> will be applied to your contribution to maintain our service.
              </p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isProcessing || amount === '' || !activeAccount}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isProcessing || amount === '' || !activeAccount ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : !activeAccount ? (
              'Connect Wallet to Contribute'
            ) : (
              'Contribute Now'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContributionForm;