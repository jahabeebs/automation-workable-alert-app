import { ethers } from 'ethers';
import { sequencerABI } from "../abi/sequencerABI";

export class Sequencer {
    private contract: ethers.Contract;

    constructor(address: string, provider: ethers.Provider) {
        this.contract = new ethers.Contract(address, sequencerABI, provider);
    }

    async numJobs(): Promise<number> {
        return this.contract.numJobs();
    }

    async jobAt(index: number): Promise<string> {
        return this.contract.jobAt(index);
    }

    async numNetworks(): Promise<number> {
        return this.contract.numNetworks();
    }

    async networkAt(index: number): Promise<string> {
        return this.contract.networkAt(index);
    }

    async windows(network: string): Promise<{ start: BigInt; length: BigInt }> {
        return this.contract.windows(network);
    }

    on(event: 'AddJob' | 'RemoveJob', callback: (...args: any[]) => void): void {
        this.contract.on(event, callback);
    }
}