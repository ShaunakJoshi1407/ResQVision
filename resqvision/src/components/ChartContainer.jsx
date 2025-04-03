import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ChartContainer = ({ title, children }) => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <Typography variant="h6" className="mb-4 text-blue-600">
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
