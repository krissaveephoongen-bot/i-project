import express from 'express';
import { broadcastProgress } from '../local-server.js';

const router = express.Router();

// A simple helper for delaying execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data loading simulation
const simulateDataLoading = async () => {
  const stages = [
    { id: 'USERS', name: 'Fetching user profiles', status: 'pending' },
    { id: 'PROJECTS', name: 'Loading project data', status: 'pending' },
    { id: 'TASKS', name: 'Assembling task lists', status: 'pending' },
    { id: 'ANALYTICS', name: 'Calculating analytics', status: 'pending' },
    { id: 'REPORTS', name: 'Generating reports', status: 'pending' },
  ];

  const totalStages = stages.length;
  let overallProgress = 0;

  broadcastProgress({ type: 'start', stages, progress: 0 });

  for (let i = 0; i < totalStages; i++) {
    // Set current stage to 'loading'
    stages[i].status = 'loading';
    broadcastProgress({ type: 'update', stages, progress: overallProgress });
    await delay(300); // Simulate network latency

    // Simulate work for the current stage
    const stageDuration = 1000 + Math.random() * 1500;
    const substeps = 5;
    for (let j = 0; j < substeps; j++) {
      await delay(stageDuration / substeps);
      // Update overall progress
      overallProgress += (100 / totalStages) / substeps;
      broadcastProgress({ type: 'update', stages, progress: Math.min(Math.round(overallProgress), 100) });
    }

    // Mark stage as completed
    stages[i].status = 'completed';
    overallProgress = Math.round(((i + 1) / totalStages) * 100); // Sync progress
    broadcastProgress({ type: 'update', stages, progress: overallProgress });
    await delay(200);
  }

  broadcastProgress({ type: 'complete', stages, progress: 100 });
};


router.post('/start-simulation', (req, res) => {
  res.status(202).json({ message: 'Data loading simulation started.' });

  // Run the simulation without blocking the response
  simulateDataLoading().catch(err => {
    console.error("Error during simulation:", err);
    broadcastProgress({ type: 'error', message: 'An error occurred during data loading.' });
  });
});

export default router;
