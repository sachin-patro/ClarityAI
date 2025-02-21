import React from 'react';

interface AnalysisSection {
  title: string;
  content: string | string[];
}

interface InitialAnalysisProps {
  isLoading: boolean;
  sections: {
    summary: string;
    strengths: string[];
    concerns: string[];
    valueAssessment: string;
    recommendedQuestions: string[];
  };
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
    
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="mb-6">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    ))}
  </div>
);

const Section: React.FC<AnalysisSection> = ({ title, content }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {Array.isArray(content) ? (
      <ul className="list-disc list-inside space-y-2">
        {content.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-700">{content}</p>
    )}
  </div>
);

const InitialAnalysis: React.FC<InitialAnalysisProps> = ({ isLoading, sections }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Diamond Analysis</h2>
      
      <Section 
        title="Summary" 
        content={sections.summary} 
      />
      
      <Section 
        title="Key Strengths" 
        content={sections.strengths} 
      />
      
      <Section 
        title="Potential Concerns" 
        content={sections.concerns} 
      />
      
      <Section 
        title="Value Assessment" 
        content={sections.valueAssessment} 
      />
      
      <Section 
        title="Recommended Questions for Jewelers" 
        content={sections.recommendedQuestions} 
      />
    </div>
  );
};

export default InitialAnalysis; 