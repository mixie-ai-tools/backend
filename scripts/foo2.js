require("dotenv").config(); // Load environment variables from .env
const OpenAI = require("openai"); // Updated import for v4
const axios = require("axios");

// Initialize OpenAI API with the key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

// Function to fetch text from SEC API
const fetchFilingTextFromAPI = async (secFilingUrl, item) => {
  const secApiUrl = "https://api.sec-api.io/extractor";
  const apiKey = process.env.SEC_API_KEY; // SEC API Key stored in .env

  try {
    const response = await axios.get(secApiUrl, {
      params: {
        url: secFilingUrl,
        item: item,
        type: "text",
        token: apiKey,
      },
    });

    return response.data; // Return the extracted text from the SEC API
  } catch (error) {
    console.error("Error fetching data from SEC API:", error);
    throw error;
  }
};

// Function to chunk text into smaller parts
const chunkText = (text, maxChunkLength) => {
  const chunks = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    chunks.push(text.slice(currentPosition, currentPosition + maxChunkLength));
    currentPosition += maxChunkLength;
  }

  return chunks;
};

// Function to clean up OpenAI response before parsing JSON
const cleanResponse = (response) => {
  return response.replace(/```json|```/g, "").trim();
};

// Function to summarize a chunk of text using OpenAI
const summarizeChunk = async (chunk) => {
  try {
    const prompt = `
      You are an AI financial assistant. Summarize the key financial highlights, risks, and forward-looking statements from the following 10-Q or 10-K SEC filing. Also, provide a confidence sentiment score on how positive or negative the report is. Format your response in JSON with the following structure:

      {
        "summary": "A concise summary of the document",
        "financial_highlights": "Key financial information",
        "risks": "Summary of any risks mentioned",
        "forward_looking_statements": "Summary of forward-looking statements",
        "sentiment_score": "Sentiment score (0-1 where 0 is negative and 1 is positive)"
      }

      Filing Content:
      """${chunk}"""
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const cleanedResult = cleanResponse(response.choices[0].message.content);
    return JSON.parse(cleanedResult);
  } catch (error) {
    console.error("Error summarizing chunk:", error);
    throw error;
  }
};

// Main function to fetch and summarize the SEC filing
const fetchAndSummarizeFiling = async (secFilingUrl) => {
  try {
    // Fetch the text content from SEC API
    const filingText = await fetchFilingTextFromAPI(secFilingUrl, "1A"); // Fetch Item 1A

    // Step 1: Chunk the text to fit within token limits
    const maxChunkLength = 1500; // Set the chunk size (adjust as needed)
    const chunks = chunkText(filingText, maxChunkLength);

    // Step 2: Summarize each chunk
    const summaries = [];
    for (const chunk of chunks) {
      const summary = await summarizeChunk(chunk);
      summaries.push(summary);
    }

    // Step 3: Combine summaries
    const combinedSummary = {
      summary: summaries.map((s) => s.summary).join(" "),
      financial_highlights: summaries
        .map((s) => s.financial_highlights)
        .join(" "),
      risks: summaries.map((s) => s.risks).join(" "),
      forward_looking_statements: summaries
        .map((s) => s.forward_looking_statements)
        .join(" "),
      sentiment_score:
        summaries.reduce((sum, s) => sum + s.sentiment_score, 0) /
        summaries.length,
    };

    // Step 4: Log the combined summary
    console.log(combinedSummary);
  } catch (error) {
    console.error("Error processing the filing:", error);
  }
};

// Example usage with an SEC filing URL
fetchAndSummarizeFiling(
  "https://www.sec.gov/Archives/edgar/data/1318605/000156459021004599/tsla-10k_20201231.htm"
);
