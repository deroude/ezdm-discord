export default {
    command: 'gen-res',
    handler: async (genAI, args, message) => {
        const action = args.shift();
        const context = args.shift();
        const roll = args.shift();
        const charText = await genAI.generateLogResolution(action, context, roll, message.channel.id);
        message.channel.reply(charText);
    },
    example: 'gen-res|Magnus 7 Moustache Knots says: I know one of you no good pests took my scissors|Kodi clumsily tries to conceal the scissors|9'
}