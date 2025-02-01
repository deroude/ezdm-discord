import { Client, Events, GatewayIntentBits } from 'discord.js';
import genChar from './commands/gen-char.js'

const supportedCommands = [genChar]

export function runDiscordBot(genAI, db) {

    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    // When the client is ready, run this code (only once).
    // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
    // It makes some properties non-nullable.
    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    // Log in to Discord with your client's token
    client.login(process.env.DISCORD_BOT_TOKEN);

    // client.on(Events.InteractionCreate, async interaction => {
    // 	if (!interaction.isChatInputCommand()) return;

    // 	const command = interaction.client.commands.get(interaction.commandName);

    // 	if (!command) {
    // 		console.error(`No command matching ${interaction.commandName} was found.`);
    // 		return;
    // 	}

    // 	try {
    // 		await command.execute(interaction);
    // 	} catch (error) {
    // 		console.error(error);
    // 		if (interaction.replied || interaction.deferred) {
    // 			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    // 		} else {
    // 			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    // 		}
    // 	}
    // });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.content.startsWith('&ezdm')) return;
        console.log(`got a message from ${message.author.displayName}`)
        const args = message.content.slice(4).trim().split('|');
        if (args.length === 0) return;
        const userCmd = args.shift()?.toLowerCase();
        const cmd = supportedCommands.find(c => c.command.equals(userCmd))
        if (!cmd) {
            console.log('Unknown command')
            message.reply(`EZDM supported commands: ${supportedCommands.map(c => c.command).join(',')}`)
            return;
        }
        console.log(`executing command ${cmd.command}`)
        return cmd.handler(genAI, args, message);
    })
}