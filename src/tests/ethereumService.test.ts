import { ethereumService } from '../services/ethereumService';
import { config } from '../config';
import { ethers } from 'ethers';
import { sequencerABI } from '../abi/sequencerABI';
import { discordService } from '../services/discordService';

jest.mock('../services/discordService', () => ({
  discordService: {
    sendAlert: jest.fn(),
  },
}));

describe('EthereumService', () => {
  beforeAll(async () => {
    await ethereumService.initialize();
  });

  it('should fetch active jobs', async () => {
    const sequencer = new ethers.Contract(config.sequencerAddress, sequencerABI, ethereumService.provider);

    const numJobs = await sequencer.numJobs();
    const jobAddresses = [];
    for (let i = 0; i < numJobs; i++) {
      jobAddresses.push(await sequencer.jobAt(i));
    }

    const activeJobs = await ethereumService.getActiveJobs();
    expect(activeJobs).toBeDefined();
  });

  it('should fetch active network', async () => {
    const sequencer = new ethers.Contract(config.sequencerAddress, sequencerABI, ethereumService.provider);

    const numNetworks = await sequencer.numNetworks();
    const currentBlockNumber = await ethereumService.provider.getBlockNumber();

    for (let i = 0; i < numNetworks; i++) {
      const network = await sequencer.networkAt(i);
      const window = await sequencer.windows(network);

      const windowStart = Number(window.start);
      const windowLength = Number(window.length);
      const pos = currentBlockNumber % windowLength;

      if (windowStart <= pos && pos < windowStart + windowLength) {
        return network;
      }
    }

    const fetchedActiveNetwork = await ethereumService.getActiveNetwork();
    expect(fetchedActiveNetwork).toBeDefined();
  });

  describe('checkJobInactivity', () => {
    it('should not send a Discord alert when a job is active within the specified number of blocks', async () => {
      const jobAddress = '0xb794f5ea0ba39494ce839613fffba74279579268';
      const consecutiveBlocksThreshold = 10;
      const currentBlockNumber = 100;
      const lastWorkBlockNumber = 95;

      ethereumService.provider.getBlockNumber = jest.fn().mockResolvedValue(currentBlockNumber);
      ethereumService.getActiveNetwork = jest.fn().mockResolvedValue('0xb794f5ea0ba39494ce839613fffba74279579268');
      ethereumService.lastWorkBlockNumbers[jobAddress] = lastWorkBlockNumber;

      await ethereumService.checkJobInactivity(jobAddress, consecutiveBlocksThreshold);

      expect(discordService.sendAlert).not.toHaveBeenCalled();
    });

    it('should send a Discord alert when a job is inactive for the specified number of blocks', async () => {
      const jobAddress = '0xb794f5ea0ba39494ce839613fffba74279579268';
      const consecutiveBlocksThreshold = 10;
      const currentBlockNumber = 100;
      const lastWorkBlockNumber = 80;

      ethereumService.provider.getBlockNumber = jest.fn().mockResolvedValue(currentBlockNumber);
      ethereumService.getActiveNetwork = jest.fn().mockResolvedValue('0xb794f5ea0ba39494ce839613fffba74279579268');
      ethereumService.lastWorkBlockNumbers[jobAddress] = lastWorkBlockNumber;

      await ethereumService.checkJobInactivity(jobAddress, consecutiveBlocksThreshold);

      expect(discordService.sendAlert).toHaveBeenCalledWith(
        expect.stringContaining("is workable but hasn't been worked on for the past"),
      );
    });
  });

  describe('handleWorkEvent', () => {
    it('should update lastWorkBlockNumbers correctly when a Work event is emitted', async () => {
      const jobAddress = '0xb794f5ea0ba39494ce839613fffba74279579268';
      const blockNumber = 100;

      await ethereumService.handleWorkEvent(jobAddress, blockNumber);

      expect(ethereumService.lastWorkBlockNumbers[jobAddress]).toBe(blockNumber);
    });
  });

  describe('setupEventListeners', () => {
    it('should set up event listeners for AddJob and RemoveJob events', () => {
      const addJobSpy = jest.spyOn(ethereumService.sequencer, 'on').mockImplementation((event, callback) => {
        if (event === 'AddJob') {
          callback('0xb794f5ea0ba39494ce839613fffba74279579268');
        }
      });

      const removeJobSpy = jest.spyOn(ethereumService.sequencer, 'on').mockImplementation((event, callback) => {
        if (event === 'RemoveJob') {
          callback('0xb794f5ea0ba39494ce839613fffba74279579268');
        }
      });

      ethereumService.setupEventListeners();

      expect(addJobSpy).toHaveBeenCalledWith('AddJob', expect.any(Function));
      expect(removeJobSpy).toHaveBeenCalledWith('RemoveJob', expect.any(Function));
    });
  });
});
