import { ethers } from 'ethers';
import { jobABI } from '../abi/jobABI';

/**
 * Job class represents a wrapper around a job contract--we are using Oracle Job as the default ABI.
 * It provides methods to interact with the contract and retrieve information.
 */
export class Job {
  private contract: ethers.Contract;

  /**
   * Creates an instance of the Job class.
   * @param address The address of the job contract.
   * @param provider The ethers.Provider instance.
   */
  constructor(address: string, provider: ethers.Provider) {
    this.contract = new ethers.Contract(address, jobABI, provider);
  }

  /**
   * Registers a callback function to be invoked when the 'Work' event is emitted.
   * @param event The event name ('Work').
   * @param callback The callback function to be invoked.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: 'Work', callback: (...args: any[]) => void): void {
    this.contract.on(event, callback);
  }

  /**
   * Removes all listeners for the 'Work' event.
   * @param event The event name ('Work').
   */
  removeAllListeners(event: 'Work'): void {
    this.contract.removeAllListeners(event);
  }
}
