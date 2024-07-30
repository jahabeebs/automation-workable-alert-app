import { ethereumService } from './services/ethereumService';
import { discordService } from './services/discordService';
import { errorHandler } from './utils/errorHandler';

const consecutiveBlocksThreshold = 10;

async function main() {
    try {
        await ethereumService.initialize();
        await discordService.initialize();

        ethereumService.setupEventListeners();

        setInterval(async () => {
            const activeJobs = await ethereumService.getActiveJobs();

            for (const jobAddress of activeJobs) {
                console.log(activeJobs, 'activeJobs')
                await ethereumService.checkJobInactivity(jobAddress, consecutiveBlocksThreshold);
            }
        }, 60000);
    } catch (error) {
        errorHandler(error);
    }
}

main().catch(errorHandler);