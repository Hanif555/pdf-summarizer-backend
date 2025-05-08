const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(fileUpload());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send('No file uploaded.');
  }

  const pdf = req.files.pdf;
  const data = await pdfParse(pdf.data);
  const text = data.text.slice(0, 2000); // Trim for token limits

  const summary = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You summarize documents into short study notes.' },
      { role: 'user', content: `Summarize the following into notes:\n\n${text}` }
    ],
    max_tokens: 300,
  });

  res.json({ summary: summary.data.choices[0].message.content });
});

app.listen(5000, () => console.log('Server running on port 5000'));
