import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create an instance of OpenAI
const openai = new OpenAIApi(configuration);

// Initialize Express application
const app = express();

// Set up middle-wares: Allowing cross origin requests, so that server can be called from the front-end
app.use(cors());
app.use(express.json());

// Create dummy route
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Grammy!",
  });
});

// Post route allows us to have a payload
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    // Send response to front-end
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// Ensure that server listens for new requests
const port = 8000;
app.listen(port, () =>
  console.log("Server is running on port http://localhost:5000")
);
