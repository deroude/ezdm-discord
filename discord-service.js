import { Client, Events, GatewayIntentBits } from 'discord.js';
import genChar from './commands/gen-char.js';
import genAdv from './commands/gen-adv.js';
import genResHint from './commands/gen-res-hint.js';
import genRes from './commands/gen-res.js';

const supportedCommands = [genChar, genAdv, genResHint, genRes]
const listeners = {};

const talks = {};

export function runDiscordBot(genAI, db) {

    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    // When the client is ready, run this code (only once).
    // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
    // It makes some properties non-nullable.
    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        if (message.content.trim() === '&ezdm listen') {
            if (message.channel.id in listeners) {
                message.reply('EZDM says yeah, still here, keep talking');
                return;
            }
            listeners[message.channel.id] = [];
            message.reply('EZDM is listening');
            return;
        }

        if (message.content.trim() === '&ezdm commit') {
            const batch = db.batch();
            for (const content of listeners[message.channel.id]) {
                const dmsg = db.collection(`sessions/${message.channel.id}/log`).doc()
                batch.set(dmsg, { content })
            }
            await batch.commit();
            delete listeners[message.channel.id]
            message.reply('EZDM saved the thread of the story');
            return;
        }

        if (message.content.trim() === '&ezdm cancel') {
            delete listeners[message.channel.id]
            delete talks[message.channel.id]
            message.reply('EZDM is no longer listening');
            return;
        }

        if (message.channel.id in listeners) {

            if (message.content.startsWith('&ezdm')) {
                message.reply('EZDM is listening to a story thread and cannot execute other commands right now');
                return;
            }

            if (listeners[message.channel.id].length === 10) {
                delete listeners[message.channel.id]
                message.reply('EZDM kaboom. Your story thread was forgotten');
                return;
            }

            listeners[message.channel.id].push(message.content)

            if (listeners[message.channel.id].length === 10) {
                message.reply('EZDM has a short memory. If you add one more message, it will explode and forget your story thread.')
            }
            return;
        }

        if (message.content.trim().startsWith('&ezdm talk')) {
            if (message.channel.id in talks) {
                message.reply('EZDM says yeah, still here, keep talking');
                return;
            }
            const args = message.content.slice(11).trim().split('|');
            const topicReply = await genAI.startTalk(args[0], args[1]);
            talks[message.channel.id] = [{
                role: "model",
                message: topicReply
            }];
            message.channel.send(topicReply);
            return;
        }

        if (message.channel.id in talks) {

            if (message.content.startsWith('&ezdm')) {
                message.reply('EZDM is listening to a story thread and cannot execute other commands right now');
                return;
            }

            talks[message.channel.id].push({ role: 'user', message: message.content })
            const topicReply = await genAI.replyOnTalk(talks[message.channel.id]);
            talks[message.channel.id].push({
                role: "model",
                message: topicReply
            });
            message.channel.send(topicReply);
            return;
        }

        if (!message.content.startsWith('&ezdm')) {
            return;
        }

        const args = message.content.slice(6).trim().split('|');
        if (args.length === 0) return;
        const userCmd = args.shift()?.toLowerCase();

        const cmd = supportedCommands.find(c => c.command === userCmd)
        if (!cmd) {
            console.log('Unknown command')
            message.reply(`EZDM supported commands:\n ${supportedCommands.map(c => `- ${c.example}`).join('\n')} \n- listen\n- commit\n- cancel`)
            return;
        }
        console.log(`executing command ${cmd.command}`)
        return cmd.handler(genAI, args, message);
    })


    // Log in to Discord with your client's token
    client.login(process.env.DISCORD_BOT_TOKEN);
}