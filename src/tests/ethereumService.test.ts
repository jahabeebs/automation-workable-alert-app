import { ethereumService } from '../services/ethereumService';
import { config } from '../config';
import { encodeBytes32String, ethers } from 'ethers';
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
        let activeNetwork = null;

        for (let i = 0; i < numNetworks; i++) {
            const network = await sequencer.networkAt(i);
            const window = await sequencer.windows(network);
            const currentBlockNumber = await ethereumService.provider.getBlockNumber();

            const windowStart = Number(window.start);
            const windowLength = Number(window.length);

            if (
                currentBlockNumber >= windowStart &&
                currentBlockNumber < windowStart + windowLength
            ) {
                activeNetwork = network;
                break;
            }
        }

        const fetchedActiveNetwork = await ethereumService.getActiveNetwork();
        expect(fetchedActiveNetwork).toBe(activeNetwork);
    });

    it('should call workable for a job', async () => {
        const job = new ethers.Contract('0xe717Ec34b2707fc8c226b34be5eae8482d06ED03', [
            'function workable(bytes32) view returns (bool, bytes)',
        ], ethereumService.provider);

        const network = encodeBytes32String('network');
        jest.spyOn(job, 'workable').mockResolvedValue([true, '0x']);

        const [canWork, args] = await job.workable(network);
        expect(canWork).toBe(true);
        expect(args).toBe('0x');
    });
});