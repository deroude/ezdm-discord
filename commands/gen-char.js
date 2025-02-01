import { AttachmentBuilder } from 'discord.js'
export default {
    command: 'gen-char',
    handler: async (genAI, args, message) => {
        const name = args.shift();
        const clazz = args.shift();
        const gender = args.shift();
        const race = args.shift();
        const userHint = args.shift();
        const charText = await genAI.generateCharacter(userHint, name, gender, clazz, race);
        const content = new AttachmentBuilder(Buffer.from(charText.response.text()), { name: `character-${name || ''}.markdown` })
        message.channel.send({ files: [content] });
    },
    example: 'gen-char|Rufus the Skinny|fighter|male|orc|tall, thin orc who left the hord because he felt rejected on account of his food disorder'
}