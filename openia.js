import { Configuration, OpenAIApi } from "openai";
import whatsappweb from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappweb;
import qrcode from "qrcode-terminal";
import * as dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function sendToOpenApi(text) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    max_tokens: 2048,
    temperature: 1,
  });
  if (response.status === 200) {
    return response.data.choices[0].text;
  } else {
    return "Houve um erro ao fazer a requisicao para o chat GPT";
  }
}

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

whatsapp.initialize();

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

whatsapp.on("authenticated", () => {
  console.log("Authentication complete");
});
whatsapp.on("ready", () => {
  console.log("Ready to accept messages");
});

async function main() {
  whatsapp.on("message", (message) => {
    (async () => {
      const chat = await message.getChat();
      
      if (message.from !== "status@broadcast" && message.type === "chat" && message.broadcast === false && chat.isGroup === false) {
        console.log(
          `From: ${message.from} (${message._data.notifyName})`
        );
  
        console.log(`Message: ${message.body}`);

         const response = await sendToOpenApi(message.body);
      console.log(`Resposta do chat GPT: ${response}`);

      message.reply(response);
  
      }

      
      
     
    })();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
