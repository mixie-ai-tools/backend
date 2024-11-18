const axios = require("axios");

const fetchFilings = async (cik, formTypes = ["10-Q", "8-K"], limit = 2) => {
  try {
    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const headers = {
      "User-Agent": "YourAppName (your@email.com)",
    };

    // Fetch the latest submissions for the company
    const { data } = await axios.get(url, { headers });

    // Filter the submissions by form type
    const filteredFilings = data.filings.recent.form
      .map((form, index) => ({
        formType: form,
        date: data.filings.recent.filingDate[index],
        accessionNumber: data.filings.recent.accessionNumber[index],
        fileNumber: data.filings.recent.primaryDocument[index],
      }))
      .filter((filing) => formTypes.includes(filing.formType))
      .slice(0, limit); // Limit to the latest N filings

    // Display the results
    filteredFilings.forEach((filing) => {
      console.log(`Form Type: ${filing.formType}`);
      console.log(`Filing Date: ${filing.date}`);
      console.log(`Accession Number: ${filing.accessionNumber}`);
      console.log(
        `Document URL: https://www.sec.gov/Archives/edgar/data/${cik}/${filing.accessionNumber.replace(
          /-/g,
          ""
        )}/${filing.fileNumber}`
      );
      console.log("---");
    });
  } catch (error) {
    console.error("Error fetching filings:", error);
  }
};

const rokuCIK = "0001428439"; // Roku's CIK
fetchFilings(rokuCIK);
