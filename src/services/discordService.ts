import { Client, IntentsBitField } from 'discord.js';
import { config } from '../config';
import { errorHandler } from '../utils/errorHandler';

class DiscordService {
    client!: Client;

    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const intent = new IntentsBitField(8);
            this.client = new Client({ intents: intent });
            await this.client.login(config.discordBotToken);
        } catch (error) {
            errorHandler(error);
            throw new Error('Failed to initialize Discord service');
        }
    }

    async sendAlert(message: string) {
        try {
            const channel = this.client.channels.cache.get(config.discordChannelId)
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