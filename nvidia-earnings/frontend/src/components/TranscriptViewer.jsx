import React, { useState } from 'react';

const TranscriptViewer = ({ transcript }) => {
  const [showFull, setShowFull] = useState(false);
  const previewLength = 500;

  const toggleShowFull = () => setShowFull(!showFull);

  const management = transcript?.management || {};
  const qa = transcript?.qa || {};

  const managementText = management.themes?.join(', ') || 'No management content available.';
  const qaText = qa.themes?.join(', ') || 'No Q&A content available.';

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Transcript Summary</h3>

      <div className="bg-gray-50 p-4 rounded text-sm max-h-96 overflow-y-auto">
        {showFull ? (
          <>
            <p><strong>Management Themes:</strong> {managementText}</p>
            <p className="mt-2"><strong>Q&A Themes:</strong> {qaText}</p>
            <button className="text-blue-500 mt-2" onClick={toggleShowFull}>
              Show Less
            </button>
          </>
        ) : (
          <>
            <p><strong>Management Themes:</strong> {managementText.slice(0, previewLength)}...</p>
            <button className="text-blue-500 mt-2" onClick={toggleShowFull}>
              Show More
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TranscriptViewer;
