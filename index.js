import { Configuration, OpenAIApi } from "openai";
import express from "express";
import axios from "axios";
import {
  API_HOST,
  API_PORT,
  API_SESSION,
  API_SESSION_KEY,
  OPENAI_API_KEY,
} from "./config.js";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

async function sendToOpenAI(text) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 2048,
      temperature: 1,
    });

    if (response.status === 200) {
      return response.data.choices[0].text;
    } else {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
  } catch (error) {
    return "Desculpe, ocorreu um erro ao enviar a requisição para o OpenAI API.";
  }
}

async function sendTextMessage(number, text) {
  try {
    const data = {
      session: API_SESSION,
      number,
      text,
    };
    const result = await axios.post(`${API_HOST}:${API_PORT}/sendText`, data, {
      headers: {
        'Content-Type': 'application/json',
        sessionkey: API_SESSION_KEY,
      },
    });
    return result.status;  
  } catch (error) {
    throw new Error('Failed to send message',error);
  }
}

const app = express();
app.use(express.json());

/**
 * @property {string} wook - Recebe o tipo de evento ocorrido na plataforma.
 * @property {string} type - Tipo do conteúdo da mensagem.
 * @property {boolean} isGroupMsg - Indica se a mensagem é de grupo ou não.
 * @property {string} content - Conteúdo da mensagem.
 * @property {string} from - Número que enviou a mensagem.
 * @property {boolean} fromMe - Indica se a mensagem foi enviada pelo usuário.
 */

app.post('/webhook', async (req, res, next) => {
  try {
    const { wook, type, isGroupMsg, content, from, fromMe } = req.body;
    if (wook === 'RECEIVE_MESSAGE' && !isGroupMsg && !fromMe && type === 'text' && content.trim().length > 0) {
      const response = await sendToOpenAI(content);
      await sendTextMessage(from, response);
    }
    res.end();
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log('O servidor está escutando na porta 3000');
});



