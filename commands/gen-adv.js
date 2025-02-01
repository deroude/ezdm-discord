import { AttachmentBuilder } from 'discord.js'
export default {
    command: 'gen-adv',
    handler: async (genAI, args, message) => {
        const userHint = args.shift();
        const charText = await genAI.generateAdventure(userHint);
        const content = new AttachmentBuilder(Buffer.from(charText.response.text()), { name: `adventure-${message.channel.id}.markdown` })
        message.channel.send({ files: [content] });
    },
    example: 'gen-adv|The Furriest Red Cat has been stolen from the Castle of Julien Long Beard'
}