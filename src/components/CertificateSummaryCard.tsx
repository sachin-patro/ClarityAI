import React from 'react';
import { 
  FaGem, 
  FaPalette, 
  FaSearch, 
  FaCut, 
  FaBarcode, 
  FaBuilding,
  FaFlask 
} from 'react-icons/fa';

interface CertificateSpec {
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificateNumber: string;
  laboratory: 'GIA' | 'IGI';
  type: 'Natural' | 'Lab-Grown';
}

interface CertificateSummaryCardProps {
  specs: CertificateSpec;
}

const CertificateSummaryCard: React.FC<CertificateSummaryCardProps> = ({ specs }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full sticky top-4">
      <h2 className="text-xl font-semibold mb-6">Certificate Summary</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaFlask className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Diamond Type</p>
            <p className="font-medium text-lg">{specs.type}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaGem className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Carat Weight</p>
            <p className="font-medium text-lg">{specs.carat}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaPalette className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="font-medium text-lg">{specs.color}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaSearch className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Clarity</p>
            <p className="font-medium text-lg">{specs.clarity}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaCut className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cut</p>
            <p className="font-medium text-lg">{specs.cut}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaBarcode className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Certificate #</p>
            <p className="font-medium">{specs.certificateNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <FaBuilding className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Laboratory</p>
            <p className="font-medium text-lg">{specs.laboratory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateSummaryCard; 