export default {
    command: 'gen-res-hint',
    handler: async (genAI, args, message) => {
        const userHint = args.shift();
        const charText = await genAI.generateLogSuggestion(userHint, message.channel.id);
        message.channel.reply(charText);
    },
    example: 'gen-res-hint|Magnus 7 Moustache Knots wants to make an Investigation check to find his favourite moustache trimmer'
}