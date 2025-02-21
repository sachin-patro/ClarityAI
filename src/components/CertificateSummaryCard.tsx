import React from 'react';
import { 
  FaGem, 
  FaPalette, 
  FaSearch, 
  FaCut, 
  FaBarcode, 
  FaBuilding 
} from 'react-icons/fa';

interface CertificateSpec {
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificateNumber: string;
  laboratory: 'GIA' | 'IGI';
}

interface CertificateSummaryCardProps {
  specs: CertificateSpec;
}

const CertificateSummaryCard: React.FC<CertificateSummaryCardProps> = ({ specs }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Certificate Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <FaGem className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Carat Weight</p>
            <p className="font-medium">{specs.carat}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FaPalette className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="font-medium">{specs.color}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FaSearch className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Clarity</p>
            <p className="font-medium">{specs.clarity}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FaCut className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Cut</p>
            <p className="font-medium">{specs.cut}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FaBarcode className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Certificate #</p>
            <p className="font-medium">{specs.certificateNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FaBuilding className="text-blue-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Laboratory</p>
            <p className="font-medium">{specs.laboratory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateSummaryCard; 