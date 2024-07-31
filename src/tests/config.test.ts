import dotenv from 'dotenv';
import { config } from '../config';

dotenv.config({ path: '.env' });

describe('Environment Variables', () => {
  it('should have PROVIDER_URL defined', () => {
    expect(config.providerUrl).toBeDefined();
    expect(config.providerUrl).not.toBe('');
  });

  it('should have DISCORD_BOT_TOKEN defined', () => {
    expect(config.discordBotToken).toBeDefined();
    expect(config.discordBotToken).not.toBe('');
  });

  it('should have DISCORD_CHANNEL_ID defined', () => {
    expect(config.discordChannelId).toBeDefined();
    expect(config.discordChannelId).not.toBe('');
  });
});
