export default {
    command: 'gen-char',
    handler: async (genAI, args, message) => {
        const name = args.shift();
        const clazz = args.shift();
        const gender = args.shift();
        const race = args.shift();
        const userHint = args.shift();
        const charText = await genAI.generateCharacter(userHint, name, gender, clazz, race);
        message.reply(charText.response.text());
    }
}