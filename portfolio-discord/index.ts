import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest
): Promise<void> => {
	context.log("HTTP trigger function processed a request.");
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	const name = req.query.name || (req.body && req.body.name);
	const contact = req.query.contact || (req.body && req.body.contact);
	const message = req.query.message || (req.body && req.body.message);

	client.once("ready", async () => {
		console.log("Ready!");
		const target = await client.users
			.fetch(process.env.DISCORD_TARGET)

			.catch((err) => {
				console.error("Can't find user: " + process.env.DISCORD_TARGET);
				throw err;
			});

		console.log(target.username);

		let dm = target.dmChannel;
		if (!dm) {
			dm = await target.createDM();
			console.log(dm.id);
		}

		const embed = new EmbedBuilder()
			.setTitle(name ? "Message From: " + name : "Message")
			.setDescription(message || "Empty Description")
			.addFields([
				{
					name: "Contact",
					value: contact || "Unspecified",
				},
			])
			.setTimestamp();

		await dm.send({ embeds: [embed] });

		console.log("Destroying");
		client.destroy();
	});

	client.login(process.env.DISCORD_TOKEN).catch((err) => {
		console.log("Invalid Token");
		throw err;
	});

	context.res = {
		// status: 200, /* Defaults to 200 */
		// body: ,
	};
};

export default httpTrigger;
