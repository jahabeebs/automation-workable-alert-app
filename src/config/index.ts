import dotenv from 'dotenv';

dotenv.config();

export const config = {
    providerUrl: process.env.PROVIDER_URL || '',
    sequencerAddress: '0x238b4E35dAed6100C6162fAE4510261f88996EC9',
    discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
    discordChannelId: process.env.DISCORD_CHANNEL_ID || '',
};