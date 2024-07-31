import { JsonRpcProvider } from 'ethers';
import { Sequencer } from '../contracts/Sequencer';
import { Job } from '../contracts/Job';
import { config } from '../config';
import { discordService } from './discordService';
import { errorHandler } from '../utils/errorHandler';

class EthereumService {
  provider!: JsonRpcProvider;
  sequencer!: Sequencer;
  lastWorkBlockNumbers: { [jobAddress: string]: number } = {};

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the Ethereum service by setting up the provider and sequencer.
   * @throws {Error} If initialization fails.
   */
  async initialize() {
    try {
      this.provider = new JsonRpcProvider(config.providerUrl);
      this.sequencer = new Sequencer(config.sequencerAddress, this.provider);
    } catch (error) {
      errorHandler(error);
      throw new Error('Failed to initialize Ethereum service');
    }
  }

  /**
   * Retrieves the list of active job addresses from the sequencer.
   * @returns {Promise<string[]>} A promise that resolves to an array of active job addresses.
   */
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

  /**
   * Retrieves the currently active network based on the current block number and network windows.
   * @returns {Promise<string | null>} A promise that resolves to the active network or null if no active network is found.
   */
  async getActiveNetwork(): Promise<string | null> {
    try {
      const numNetworks = await this.sequencer.numNetworks();
      const currentBlockNumber = await this.provider.getBlockNumber();

      for (let i = 0; i < numNetworks; i++) {
        const network = await this.sequencer.networkAt(i);
        const window = await this.sequencer.windows(network);

        const windowStart = Number(window.start);
        const windowLength = Number(window.length);
        const pos = currentBlockNumber % windowLength;

        if (windowStart <= pos && pos < windowStart + windowLength) {
          return network;
        }
      }

      return null;
    } catch (error) {
      errorHandler(error);
      return null;
    }
  }

  /**
   * Checks if a job has been inactive for 10 consecutive blocks and sends a Discord alert if necessary.
   * @param {string} jobAddress - The address of the job to check for inactivity.
   * @param {number} consecutiveBlocksThreshold - The number of consecutive blocks of inactivity required to trigger an alert (currently 10).
   */
  async checkJobInactivity(jobAddress: string, consecutiveBlocksThreshold: number): Promise<void> {
    try {
      const currentBlockNumber = await this.provider.getBlockNumber();
      const lastWorkBlockNumber = this.lastWorkBlockNumbers[jobAddress] || 0;

      if (currentBlockNumber - lastWorkBlockNumber >= consecutiveBlocksThreshold && lastWorkBlockNumber !== 0) {
        const activeNetwork = await this.getActiveNetwork();

        if (activeNetwork) {
          await discordService.sendAlert(
            `Job ${jobAddress} is workable but hasn't been worked on for the past ${consecutiveBlocksThreshold} blocks on network ${activeNetwork}.`,
          );
        }
      }
    } catch (error) {
      errorHandler(error);
    }
  }

  /**
   * Handles the 'Work' event emitted by a job contract and updates the last work block number for the job.
   * @param {string} jobAddress - The address of the job.
   * @param {number} blockNumber - The block number at which the 'Work' event occurred.
   */
  async handleWorkEvent(jobAddress: string, blockNumber: number): Promise<void> {
    if (blockNumber > (this.lastWorkBlockNumbers[jobAddress] || 0)) {
      this.lastWorkBlockNumbers[jobAddress] = blockNumber;
    }
  }

  /**
   * Sets up event listeners for the 'AddJob' and 'RemoveJob' events emitted by the sequencer.
   * Initializes the last work block number for new jobs and removes event listeners for removed jobs.
   */
  setupEventListeners() {
    this.sequencer.on('AddJob', async (jobAddress: string) => {
      try {
        const job = new Job(jobAddress, this.provider);
        this.lastWorkBlockNumbers[jobAddress] = 0;
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
