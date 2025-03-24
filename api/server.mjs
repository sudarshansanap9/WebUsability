import { launch } from "chrome-launcher";
import express from "express";
import fs from "fs";
import lighthouse from "lighthouse";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.static("./public"));
app.use(cors()); // Allow all origins

// Function to run Lighthouse audit (Saves reports in `public/`)
async function runLighthouse(url) {
  const chrome = await launch({ chromeFlags: ["--headless"] });
  const options = { logLevel: "info", output: "html", port: chrome.port };
  const runnerResult = await lighthouse(url, options);

  const reportHtml = runnerResult.report;
  await chrome.kill();

  const htmlFilePath = path.join(__dirname, "public", "report.html");
  fs.writeFileSync(htmlFilePath, reportHtml);

  return htmlFilePath;
}

// Convert HTML report to PDF (Saves in `public/`)
async function convertHtmlToPdf(htmlFilePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: "networkidle0" });

  const pdfFilePath = path.join(__dirname, "public", "report.pdf");
  await page.pdf({ path: pdfFilePath, format: "A4" });

  await browser.close();
  return pdfFilePath;
}

// Extract key data for OpenAI processing
const extractLighthouseSummary = (url) => ({
  url,
  reportGenerated: true,
  keyFindings: "Performance, Accessibility, SEO, and Best Practices summarized.",
});

// Function to process Lighthouse data with OpenAI & enforce strict JSON
const processLighthouseWithOpenAI = async (lighthouseSummary) => {
  return exponentialBackoff(async () => {
    const prompt = `
      You are an API that processes Lighthouse reports and returns structured JSON.
      
      Given this Lighthouse summary:
      ${JSON.stringify(lighthouseSummary)}

      If the any category is not found then do the best you can to fill in the data and return the scores WITHOUT null values, and change the predefined overviews, issues and improvements to be relevant to the website.
      Format the output strictly like this:

      {
        "Performance": {
          "Score": (integer),
          "Overview": "Fun and engaging summary about site speed",
          "KeyMetrics": {
            "First Contentful Paint (FCP)": { "value": (float), "unit": "s", "description": "Cool Gen-Z explanation" },
            "Speed Index": { "value": (float), "unit": "s", "description": "Cool Gen-Z explanation" },
            "Largest Contentful Paint (LCP)": { "value": (float), "unit": "s", "description": "Cool Gen-Z explanation" },
            "Time to Interactive (TTI)": { "value": (float), "unit": "s", "description": "Cool Gen-Z explanation" },
            "Total Blocking Time (TBT)": { "value": (integer), "unit": "ms", "description": "Cool Gen-Z explanation" }
          },
          "Improvements": ["Fix image sizes", "Remove unused JS", "Lazy load images"]
        },
        "Accessibility": {
          "Score": (integer),
          "Overview": "Fun summary about accessibility issues",
          "KeyMetrics": { "Alt Text": "Cool Gen-Z explanation", "Contrast": "Cool Gen-Z explanation" },
          "Improvements": ["Fix contrast", "Add alt text"]
        },
        "BestPractices": {
          "Score": (integer),
          "Overview": "Fun summary about best practices",
          "KeyMetrics": { "HTTPS": "Cool Gen-Z explanation", "Console Errors": "Cool Gen-Z explanation" },
          "Improvements": ["Use HTTPS", "Fix errors"]
        },
        "SEO": {
          "Score": (integer),
          "Overview": "Fun summary about SEO",
          "KeyMetrics": { "Meta Description": "Cool Gen-Z explanation", "Crawlable Links": "Cool Gen-Z explanation" },
          "Improvements": ["Add meta descriptions", "Make links crawlable"]
        },
        "Readability": {
          "Score": (integer),
          "Overview": "Fun summary about readability",
          "KeyMetrics": { "Readability Score": "Cool Gen-Z explanation", "Readability Score": "Cool Gen-Z explanation" },
          "Improvements": ["Add meta descriptions", "Make links crawlable"]
        },
        "Images": {
          "Score": (integer),
          "Overview": "Fun summary about images",
          "KeyMetrics": { "Image Alt Text": "Cool Gen-Z explanation", "Image Size": "Cool Gen-Z explanation" },
          "Improvements": ["Add alt text", "Optimize image size"]
        },
        "Busniess Scope": {
          "Score": (integer),
          "Overview": "Fun summary about business scope",
          "KeyMetrics": { "Business Scope": "Cool Gen-Z explanation", "Business Scope": "Cool Gen-Z explanation" },
          "Improvements": ["Add meta descriptions", "Make links crawlable"]
        },
      }
      
      Do NOT include any extra text before or after the JSON response.
      Ensure that your response is **valid JSON only** with no extra characters.
    `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo",
          messages: [{ role: "system", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Validate OpenAI response
      if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error("Invalid response from OpenAI API");
      }

      const openAiResponse = response.data.choices[0].message.content.trim();

      // Check if response is valid JSON
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(openAiResponse);
      } catch (jsonError) {
        console.error("OpenAI response is not valid JSON:", openAiResponse);
        throw new Error("OpenAI returned invalid JSON.");
      }

      // Save OpenAI response as ai_response.json in public/
      const jsonFilePath = path.join(__dirname, "public", "ai_response.json");
      fs.writeFileSync(jsonFilePath, JSON.stringify(jsonResponse, null, 2));

      return jsonResponse;
    } catch (error) {
      console.error("Error calling OpenAI API:", error.response?.data || error.message);
      throw new Error("Failed to process Lighthouse report.");
    }
  });
};

// Exponential Backoff for OpenAI API rate limit handling
const exponentialBackoff = async (fn, retries = 5, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      const waitTime = delay * 2;
      console.warn(`Rate limited! Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return exponentialBackoff(fn, retries - 1, waitTime);
    }
    throw error;
  }
};

// API endpoint for running Lighthouse audit
app.get("/audit", async (req, res) => {

  const { url } = req.query;
  console.log("url", url);
  try {
    const htmlFilePath = await runLighthouse(url);
    const pdfFilePath = await convertHtmlToPdf(htmlFilePath);

    // Generate summary for OpenAI
    const lighthouseSummary = extractLighthouseSummary(url);
    const processedData = await processLighthouseWithOpenAI(lighthouseSummary);

    // Save OpenAI response as ai_response.json in root public folder
    const publicJsonFilePath = path.join(process.cwd(), "public", "ai_response.json");
    fs.writeFileSync(publicJsonFilePath, JSON.stringify(processedData, null, 2));

    res.json({
      message: "Reports generated successfully.",
      reports: {
        jsonUrl: "/ai_response.json",
        htmlUrl: "/report.html",
        pdfUrl: "/report.pdf",
      },
      structuredResponse: processedData, // OpenAI response is also available in the API response
    });
  } catch (error) {
    console.error("Error processing Lighthouse report:", error.message);
    res.status(500).json({ error: "Failed to generate Lighthouse report.", details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
