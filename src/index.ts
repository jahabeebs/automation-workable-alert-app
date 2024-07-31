import { ethereumService } from './services/ethereumService.js';
import { discordService } from './services/discordService.js';
import { errorHandler } from './utils/errorHandler.js';

const consecutiveBlocksThreshold = 10;
const averageBlockTimeSeconds = 15;
// Checking every 10 blocks or so to reduce RPC calls (10 * 15 = 150 seconds)
const checkIntervalSeconds = consecutiveBlocksThreshold * averageBlockTimeSeconds;

/**
 * Main driver function that initializes the services and sets up the event listeners.
 */
export const handler = async () => {
  try {
    await ethereumService.initialize();
    await discordService.initialize();

    ethereumService.setupEventListeners();

    setInterval(async () => {
      const activeJobs = await ethereumService.getActiveJobs();

      for (const jobAddress of activeJobs) {
        await ethereumService.checkJobInactivity(jobAddress, consecutiveBlocksThreshold);
      }
    }, checkIntervalSeconds * 1000);
  } catch (error) {
    errorHandler(error);
  }
};

handler().catch(errorHandler);
