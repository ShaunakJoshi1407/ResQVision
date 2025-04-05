import React from 'react';

const SeverityHeatmap = ({ filters }) => {
  return (
    <div className="p-4 bg-white rounded shadow text-gray-500 text-center">
      [Severity Heatmap Placeholder]
      <br />
      Filters: {JSON.stringify(filters)}
    </div>
  );
};

export default SeverityHeatmap;
