import { Client, IntentsBitField } from 'discord.js';
import { config } from '../config';
import { errorHandler } from '../utils/errorHandler';

class DiscordService {
  client!: Client;
  readyPromise!: Promise<void>;

  constructor() {
    this.readyPromise = this.initialize();
  }

  /**
   * Initializes the Discord service by setting up the client and logging in with the provided bot token.
   * @throws {Error} If initialization fails.
   */
  async initialize() {
    try {
      const intent = new IntentsBitField(config.discordIntentValue);
      this.client = new Client({ intents: intent });
      await this.client.login(config.discordBotToken);
      await new Promise<void>((resolve) => {
        this.client.once('ready', () => {
          resolve();
        });
      });
    } catch (error) {
      errorHandler(error);
      throw new Error('Failed to initialize Discord service');
    }
  }

  /**
   * Sends an alert message to the specified Discord channel.
   * @param {string} message - The message to send as an alert.
   * @throws {Error} If the specified channel is not found.
   */
  async sendAlert(message: string) {
    try {
      await this.readyPromise;
      const channel = await this.client.channels.fetch(config.discordChannelId);
      if (!channel) {
        throw new Error('Channel not found');
      }
      if (channel?.isTextBased()) {
        await channel.send(message);
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}

export const discordService = new DiscordService();
