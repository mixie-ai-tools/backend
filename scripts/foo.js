require("dotenv").config(); // To load the API key from .env
const axios = require("axios");

// Function to fetch data from the SEC API
const fetchSecData = async () => {
  const secApiUrl = "https://api.sec-api.io/extractor";
  const filingUrl =
    "https://www.sec.gov/Archives/edgar/data/1318605/000156459021004599/tsla-10k_20201231.htm";
  const item = "1A";
  const type = "text";
  const apiKey = process.env.SEC_API_KEY; // Access API key from the .env file

  try {
    // Make the GET request to the SEC API
    const response = await axios.get(secApiUrl, {
      params: {
        url: filingUrl,
        item: item,
        type: type,
        token: apiKey,
      },
    });

    // Log the response
    console.log("SEC Data:", response.data);
  } catch (error) {
    console.error("Error fetching SEC data:", error);
  }
};

// Call the function
fetchSecData();
