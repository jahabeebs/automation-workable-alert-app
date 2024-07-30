import { discordService } from '../services/discordService';

describe('DiscordService', () => {
    it('should initialize Discord', async () => {
        await discordService.initialize();
        expect(discordService.client).toBeDefined();
    });
});