"use client"

import BarChartRace from './components/BarChartRace';
import { useEffect, useState } from 'react';
import { BarChartRaceProps, YearData } from './types/data.types';
import '../app/globals.css';


const HomePage = () => {
  const [csvData, setCsvData] = useState<YearData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/read-csv');  // Fetching from the API
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCsvData(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className='title'>Bar Chart Race</h1>
      <BarChartRace data={csvData} />
    </div>
  );
};


export default HomePage;
