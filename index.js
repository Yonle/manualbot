require("dotenv").config();
const grammy = require("grammy");
const bot = new grammy.Bot(process.env.TOKEN);
const fs = require("fs");

let oncreate = new Map();

bot.command("start", (ctx) => ctx.reply("Hi!"));
bot.command("create", (ctx) => {
  if (ctx.message.from.id !== 651345999) return;
  ctx
    .reply("Okay! What is the command name?", {
      reply_to_message_id: ctx.message.message_id,
      reply_markup: { force_reply: true, selective: true },
    })
    .then(({ message_id }) => {
      oncreate.set(ctx.message.from.id, {
        name: null,
        description: null,
        code: null,
        stage: 1,
        replyToMessageId: message_id
      });
    });
});

fs.readdirSync(__dirname + "/cmds/")
	.filter(f => f.endsWith(".js"))
	.forEach(i => {
		let cmd = require(__dirname + "/cmds/" + i);
		console.log("/" + cmd.name + " is succesfully loaded");
		bot.command(cmd.name, cmd.run);
	});

bot.on("message", (ctx) => {
  if (!oncreate.has(ctx.message.from.id)) return;
  let sess = oncreate.get(ctx.message.from.id);
  //if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.message_id !== sess.replyToMessageId) return;
  switch (sess.stage) {
    case 1:
      sess.name = ctx.message.text.split(" ");
      ctx.reply("Any description to put on?", {
      	reply_to_message_id: ctx.message.message_id,
      	reply_markup: { force_reply: true, selective: true },
      }).then(({ message_id }) => {
        sess.stage++
        sess.replyToMessageId = message_id;
      });
      break;
    case 2:
      sess.description = ctx.message.text;
      ctx.reply(`Nice! Finally, Send the code!`, {
      	reply_to_message_id: ctx.message.message_id,
      	reply_markup: { force_reply: true, selective: true },
      }).then(({ message_id }) => {
        sess.stage++
        sess.replyToMessageId = message_id;
      });
      break;
    case 3:
      fs.writeFileSync(__dirname + "/cmds/" + sess.name + ".js",
      `const grammy = require('grammy');

module.exports = {
	name: '${sess.name}',
	description: '${sess.description}',
	run: async (ctx) => {
		${ctx.message.text}
	}
}
`, "utf8");
      let newCmd = require(__dirname + "/cmds/" + sess.name + ".js")
      bot.command(newCmd.name, newCmd.run);
      ctx.reply("Success! New command loaded!");
      sess.delete(ctx.message.from.id);
      break;
  }
});

bot.catch(e => console.error(e));
bot.start();
