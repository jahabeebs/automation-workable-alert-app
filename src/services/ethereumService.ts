import { JsonRpcProvider } from 'ethers';
import { Sequencer } from '../contracts/Sequencer';
import { Job } from '../contracts/Job';
import { config } from '../config';
import { discordService } from './discordService';
import { errorHandler } from '../utils/errorHandler';

class EthereumService {
    provider!: JsonRpcProvider;
    private sequencer!: Sequencer;
    private lastWorkBlockNumbers: { [jobAddress: string]: number } = {};

    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            this.provider = new JsonRpcProvider(config.providerUrl);
            this.sequencer = new Sequencer(config.sequencerAddress, this.provider);
        } catch (error) {
            errorHandler(error);
            throw new Error('Failed to initialize Ethereum service');
        }
    }

    async getActiveJobs(): Promise<string[]> {
        try {
            const numJobs = await this.sequencer.numJobs();
            const activeJobs: string[] = [];

            for (let i = 0; i < numJobs; i++) {
                const jobAddress = await this.sequencer.jobAt(i);
                activeJobs.push(jobAddress);
            }

            return activeJobs;
        } catch (error) {
            errorHandler(error);
            return [];
        }
    }

    async getActiveNetwork(): Promise<string | null> {
        try {
            const numNetworks = await this.sequencer.numNetworks();

            for (let i = 0; i < numNetworks; i++) {
                const network = await this.sequencer.networkAt(i);
                const window = await this.sequencer.windows(network);

                const currentBlockNumber = await this.provider.getBlockNumber();
                const windowStart = Number(window.start);
                const windowLength = Number(window.length);

                if (
                    currentBlockNumber >= windowStart &&
                    currentBlockNumber < windowStart + windowLength
                ) {
                    return network;
                }
            }

            return null;
        } catch (error) {
            errorHandler(error);
            return null;
        }
    }

    async checkJobInactivity(jobAddress: string, consecutiveBlocksThreshold: number): Promise<void> {
        try {
            const job = new Job(jobAddress, this.provider);

            const currentBlockNumber = await this.provider.getBlockNumber();
            const lastWorkBlockNumber = this.lastWorkBlockNumbers[jobAddress] || 0;

            if (currentBlockNumber - lastWorkBlockNumber >= consecutiveBlocksThreshold) {
                const activeNetwork = await this.getActiveNetwork();

                if (activeNetwork) {
                    const [canWork, args] = await job.workable(activeNetwork);

                    if (canWork) {
                        await discordService.sendAlert(
                            `Job ${jobAddress} is workable but hasn't been worked on for the past ${consecutiveBlocksThreshold} blocks on network ${activeNetwork}.`
                        );
                    }
                }
            }
        } catch (error) {
            errorHandler(error);
        }
    }

    async handleWorkEvent(jobAddress: string, blockNumber: number): Promise<void> {
        this.lastWorkBlockNumbers[jobAddress] = blockNumber;
    }

    setupEventListeners() {
        this.sequencer.on('AddJob', async (jobAddress: string) => {
            try {
                const job = new Job(jobAddress, this.provider);
                job.on('Work', (network, ilk, event) => {
                    this.handleWorkEvent(jobAddress, event.blockNumber);
                });
            } catch (error) {
                errorHandler(error);
            }
        });

        this.sequencer.on('RemoveJob', async (jobAddress: string) => {
            try {
                const job = new Job(jobAddress, this.provider);
                job.removeAllListeners('Work');
            } catch (error) {
                errorHandler(error);
            }
        });
    }
}

export const ethereumService = new EthereumService();