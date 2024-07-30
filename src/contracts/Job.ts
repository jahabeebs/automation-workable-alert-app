import { ethers } from 'ethers';
import { jobABI } from "../abi/jobABI";

export class Job {
    private contract: ethers.Contract;

    constructor(address: string, provider: ethers.Provider) {
        this.contract = new ethers.Contract(address, jobABI, provider);
    }

    on(event: 'Work', callback: (...args: any[]) => void): void {
        this.contract.on(event, callback);
    }

    async workable(network: string): Promise<[boolean, string]> {
        return this.contract.workable(network);
    }

    removeAllListeners(event: 'Work'): void {
        this.contract.removeAllListeners(event);
    }
}