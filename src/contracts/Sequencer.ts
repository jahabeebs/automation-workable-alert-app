import { ethers, JsonRpcProvider } from 'ethers';
import { sequencerABI } from '../abi/sequencerABI';

/**
 * Sequencer class represents a wrapper around the Sequencer contract.
 * It provides methods to interact with the contract and retrieve information.
 */
export class Sequencer {
  contract: ethers.Contract;

  /**
   * Creates an instance of the Sequencer class.
   * @param address The address of the Sequencer contract.
   * @param provider The JsonRpcProvider instance.
   */
  constructor(address: string, provider: JsonRpcProvider) {
    this.contract = new ethers.Contract(address, sequencerABI, provider);
  }

  /**
   * Retrieves the job address at the specified index.
   * @param index The index of the job.
   * @returns A promise that resolves to the job address.
   */
  async jobAt(index: number): Promise<string> {
    return this.contract.jobAt(index);
  }

  /**
   * Retrieves the total number of jobs.
   * @returns A promise that resolves to the number of jobs.
   */
  async numJobs(): Promise<number> {
    return this.contract.numJobs();
  }

  /**
   * Retrieves the total number of networks.
   * @returns A promise that resolves to the number of networks.
   */
  async numNetworks(): Promise<number> {
    return this.contract.numNetworks();
  }

  /**
   * Retrieves the network address at the specified index.
   * @param index The index of the network.
   * @returns A promise that resolves to the network address.
   */
  async networkAt(index: number): Promise<string> {
    return this.contract.networkAt(index);
  }

  /**
   * Retrieves the window information for the specified network.
   * @param network The network address.
   * @returns A promise that resolves to an object containing the start and length of the window.
   */
  async windows(network: string): Promise<{ start: bigint; length: bigint }> {
    return this.contract.windows(network);
  }

  /**
   * Retrieves the next workable jobs for the specified network within the given range.
   * @param network The network address.
   * @param startIndex The starting index of the range.
   * @param endIndex The ending index of the range (exclusive).
   * @returns A promise that resolves to an array of workable jobs.
   */
  async getNextJobs(
    network: string,
    startIndex: number,
    endIndex: number,
  ): Promise<{ job: string; canWork: boolean; args: string }[]> {
    return this.contract.getNextJobs(network, startIndex, endIndex);
  }

  /**
   * Registers a callback function to be invoked when the specified event is emitted.
   * @param event The event name ('AddJob' or 'RemoveJob').
   * @param callback The callback function to be invoked.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: 'AddJob' | 'RemoveJob', callback: (...args: any[]) => void): void {
    this.contract.on(event, callback);
  }
}
