const { parentPort, workerData } = require("worker_threads");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const { url, fileUrl, index } = workerData;

parentPort.postMessage({ url, fileUrl, index });
parentPort.on("message", () => {
  console.log("Worker messagTriggered");
  scrape(url, fileUrl);
  parentPort.postMessage({ success: true, index });
});

const scrape = async (url, fileUrl) => {
  try {
    console.log("Worker with index ", index);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Create an output folder for each site dynamically
    const outputFolder = path.join(fileUrl, getDomainFromUrl(url));

    // Create directory if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // await page.screenshot({ path: path.join(outputFolder, "screenshot.png") });

    // Use setTimeout to introduce a delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const content = await page.content();
    const $ = cheerio.load(content);
    const extractedText = $("body").text();

    // Save extracted text to a text file
    const textFilePath = path.join(outputFolder, "extractedText.txt");
    await fs.writeFile(textFilePath, extractedText);

    console.log(`Scraped from ${url}: ${extractedText}`);

    await browser.close();
  } catch (error) {
    console.error("Error fetching website:", error);
  }
};
