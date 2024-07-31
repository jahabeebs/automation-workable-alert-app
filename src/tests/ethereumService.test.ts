import { ethereumService } from '../services/ethereumService';
import { config } from '../config';
import { ethers } from 'ethers';
import { sequencerABI } from '../abi/sequencerABI';

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
    expect(activeJobs).toEqual(jobAddresses);
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
});
