// Import required modules
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const fsNoPromise = require("fs");
const path = require("path");
const nlp = require("compromise");
// const { Worker } = require("worker_threads");

// Create an instance of Express
const app = express();
const port = 3005; // Choose the desired port
const apiKey = process.env.API_KEY;
const searchId = process.env.SEARCH_ENGINE_ID;
const searchArray = [
  "Family",
  "Business",
  "Corruption",
  "Tax Evasion",
  "Criminal Records",
  "Political Corruption",
  "Bankruptcy",
  "Political Exposure",
  "Sanctions",
];
const resultsArray = [];

// const workers = [];
// const pages = [];
// const completedWorkerProcesses = {};

// const workerCallback = (data) => {
//   console.log(`[WORKER ${data.index}] Completed: ${Object.values(data)}`);
//   completedWorkerProcesses[data.index] = data.success;
//   workers[data.index].postMessage("next");
//   // console.log("completed worker processes", completedWorkerProcesses);
// };

// const createWorker = (url, fileUrl, index) => {
//   const worker = new Worker("./worker.js", {
//     workerData: { url, fileUrl, index },
//   });
//   worker.on("error", (err) => {
//     throw err;
//   });
//   worker.on("message", workerCallback);

//   return worker;
// };
function extractName(inputString) {
  // Remove any content in parentheses or after a dash which often includes social media handles or additional info
  let cleanedInput = inputString.replace(/\(.*?\)|-\s.*$/g, "").trim();

  // Attempt to remove any trailing details after common descriptors like "•", " - ", "/", etc.
  cleanedInput = cleanedInput.replace(/•.*$|\/.*$/g, "").trim();

  // Final cleanup to remove any residual artifacts like " -", ",", or "•" at the end of the name
  cleanedInput = cleanedInput.replace(/[\s\-•,]+$/, "").trim();

  // Extract the most likely name part before any remaining delimiters like " - " or " • "
  const nameParts = cleanedInput.split(/[\s\-•,]+/);
  if (nameParts.length > 1) {
    // Assuming the first two parts constitute the name in most cases
    return nameParts.slice(0, 2).join(" ");
  }
  return cleanedInput;
}

// Function to scrape a site based on sourcelink
// async function scrapeSite(url) {
//   try {
//     const response = await axios.get(url);

//     if (response.status === 200) {
//       const $ = cheerio.load(response.data);
//       const extractedText = $("body").text();
//       console.log(`Scraped from ${url}: ${extractedText}`);
//     } else {
//       console.error(
//         `Error: Unable to fetch HTML from ${url}. Status code:`,
//         response.status
//       );
//     }
//   } catch (error) {
//     console.error("Error fetching website:", error);
//   }
// }

// async function scrapeSite(url) {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded" });
//     await page.screenshot(url, { path: "screenshots/github.png" });

//     // Use setTimeout to introduce a delay
//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     const content = await page.content();
//     const $ = cheerio.load(content);
//     const extractedText = $("body").text();
//     // Save screenshot to a file in the specified output folder
//     const screenshotFilename = `${Date.now()}_screenshot.png`;
//     const screenshotPath = path.join(outputFolder, screenshotFilename);
//     await page.screenshot({ path: screenshotPath });

//     console.log(`Screenshot saved to ${screenshotPath}`);

//     console.log(`Scraped from ${url}: ${extractedText}`);

//     await browser.close();
//   } catch (error) {
//     console.error("Error fetching website:", error);
//   }
// }

async function scrapeSite(url, fileUrl,dataType) {
  try {
    debugger;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Create an output folder for each site dynamically
    const dataTypeFolder = path.join(fileUrl, dataType);
      await fs.mkdir(dataTypeFolder, { recursive: true });

    // Use setTimeout to introduce a delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const content = await page.content();
    const $ = cheerio.load(content);
    const extractedText = $("body").text();

    // Save extracted text to a text file
    const textFilePath = path.join(dataTypeFolder, `${getDomainFromUrl(url)}`);
    await fs.writeFile(textFilePath, extractedText);

    console.log(`Scraped from ${url}: ${extractedText}`);

    await browser.close();
  } catch (error) {
    console.error("Error fetching website:", error);
  }
}

function getDomainFromUrl(url) {
  const { hostname } = new URL(url);
  return `${hostname.replace(/\./g, "_")}.txt`;
}


// async function createIncrementalFolder(basePath, folderName) {
//   let folderPath = path.join(basePath, folderName);

//   let index = 1;
//   while (true) {
//     try {
//       await fs.mkdir(folderPath);
//       return folderPath; // Return if the folder is created successfully
//     } catch (error) {
//       // Folder already exists, try with an incremented index
//       folderPath = path.join(basePath, `${folderName}_${index}`);
//       index++;
//     }
//   }
// }

async function filterSentencesAsync(text, keywords) {
  // Tokenize the text

  const doc = nlp(text);

  // Filter sentences based on keywords

  // const filteredSentences = doc.sentences().filter((sentence) => {
  //   for (const keyword of keywords) {
  //     if (sentence.match(keyword).found) {
  //       return sentence;
  //     } else {
  //       continue;
  //     }
  //   }
  // });

  const filteredSentences = doc.sentences().filter((sentence) => {
    if (sentence.match(keyword).found) {
      return sentence;
    } 
});

  // Extract filtered sentences as an array

  return filteredSentences.out("array");
}

// Example usage

async function main() {
  const corruptionKeywords = [
    "Allege",
    "accuse",
    "bribe",
    "bribed",
    "investigate",
    "penalize",
    "probed",
    "case",
    "abuse",
    "strike",
    "accident",
    "manipulate",
    "downfall",
    "loss",
    "cronies",
    "abscond",
    "lobby",
    "compliance",
    "complying",
    "warrant",
    "sack",
    "resign",
    "forced",
    "strike",
    "accident",
    "downfall",
    "loss",
    "cartel",
    "black marketeering",
    "black marketing",
    "settlement",
  ];
  const criminalRecords = [
    "Fraud",
    "dishonest",
    "quit",
    "fired",
    "prohibit",
    "recrimination",
    "Fraud",
    "default",
    "kickback",
    "scandal",
    "probe",
    "penalty",
    "misconduct",
    "CBI",
    "imprisonment",
    "police",
    "scam",
    "vigilance",
    "litigation",
    "arrests",
    "sentenced",
    "illegal",
    "lawsuit",
    "ban",
    "banned",
    "rape",
    "raping",
    "rob",
    "theft",
    "charged",
    "mobbed",
    "jail",
    "jailed",
    "victim",
    "underworld",
    "terrorist",
    "crim",
    "prison",
    "imprisoned",
    "arrested",
    "gang",
    "smuggl",
    "kidnap",
    "fake",
    "faking",
    "malpractice",
    "suspend",
    "suspect",
    "guilty",
    "ransom",
    "extortion",
    "remand",
    "Legal notice",
    "defendants",
    "defendant",
    "Defend",
    "plaintiff",
    "illicit",
    "assail",
    "embezzlement",
  ];
  const familyAndBusiness = [
    "Mother",
    "father",
    "brother",
    "sister",
    "sister-in-law",
    "brother-in-law",
    "associate",
    "tycoon",
    "relative",
    "cousins",
    "associate",
  ];
  const taxEvasion = [
    "Lobby",
    "compliance",
    "complying",
    "warn",
    "terminate",
    "complain",
    "default",
    "cronies",
    "abscond",
    "unethical",
    "evade",
    "evasion",
    "misrepresent",
    "embezzlement",
    "extort",
  ];
  const bankruptcy = [
    "Enquiry",
    "Inquiry",
    "inquired",
    "lockUp",
    "misbehaved",
    "liquidity",
    "liquidation",
    "downfall",
    "loss",
    "bankrupt",
    "bankruptcy",
    "insolvent",
    "insolvency",
    "administration",
    "debt",
    "owe",
    "owing",
  ];
  const politicalExposure = [
    "Politics",
    "political",
    "PEP",
    "Ministry",
    "government",
    "governorship",
    "election",
    "rig",
    "rigged",
    "campaign",
    "collaborate",
    "conceal",
    "control",
    "embezzlement",
    "patriarchy",
    "recrimination",
    "rank",
    "position",
    "protest",
  ];
  const sanctions = [
    "Fines",
    "charged",
    "warned",
    "warn",
    "warning",
    "terminate",
    "termination",
    "Legal notice",
    "warrant",
    "prohibit",
    "deny",
    "seal",
  ];

  const keywordArrays = {
    corruptionKeywords,
    criminalRecords,
    familyAndBusiness,
    taxEvasion,
    bankruptcy,
    politicalExposure,
    sanctions,
  };


  const screenshotsFolderPath = path.join(__dirname, "screenshots");

  try {
    // Get a list of folders inside the "screenshots" directory
    const folders = await fs.readdir(screenshotsFolderPath);
    console.log(folders);

    for (const folder of folders) {
      const folderPath = path.join(screenshotsFolderPath, folder);
      console.log(folderPath);
      // Use path.basename to get the folder name
      const folderName = path.basename(folderPath);
      console.log(folderName)
      for (const file of folder) {
        const filePath = path.join(folderPath, file);
        console.log(filePath);
        // Use path.basename to get the folder name
        const fileName = path.basename(filePath);
        if (!fileName.startsWith("extracted")) continue;
        console.log("Folder Name:", fileName);
  
        // Check if the item is a directory
        const isDirectory = (await fs.stat(filePath)).isDirectory();
        let resultArray
        if (isDirectory) {
          // Process each array of keywords and create a text file for each folder
            // Define the path to the folder and the file
            if(folderName === "Criminal Records"){
            resultArray = await filterSentencesAsync(filePath, keywordArrays.criminalRecords);
            }else if(folderName === "Corruption"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.corruptionKeywords);
            }
            else if(folderName === "Bankruptcy"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.bankruptcy);
            }
            else if(folderName === "Business"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.familyAndBusiness);
            }
            else if(folderName === "Family"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.familyAndBusiness);
            }else if(folderName === "Political Corruption"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.corruptionKeywords);
            }
            else if(folderName === "Sanctions"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.sanctions);
            }
            else if(folderName === "Political Exposure"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.politicalExposure);
            }
            else if(folderName === "Tax Evasion"){
              resultArray = await filterSentencesAsync(filePath, keywordArrays.taxEvasion);
            }
  
            // Create a new text file inside each folder
            const extractedFilePath = path.join(
              filePath,
              `extracted.json`
            );
            await fs.writeFile(extractedFilePath, resultArray.join("\n"));
            // console.log(`Text file created at ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// async function readFileAsync() {
//   const screenshotsFolderPath = path.join(__dirname, "screenshots");

//   // Define the path to the folder and the file
//   const folderPath = "screenshots";
//   const fileName = "extractedText.txt";
//   const additionalFolderPath = "punchng_com";
//   // Construct the full path to the file
//   const filePath = path.join(
//     __dirname,
//     folderPath,
//     additionalFolderPath,
//     fileName
//   );

//   try {
//     // Read the contents of the file using fs.promises.readFile
//     const data = await fs.readFile(filePath, "utf8");

//     main(data);
//     // console.log(`File contents:\n${data}`);
//   } catch (err) {
//     console.error(`Error reading file: ${err}`);
//   }
// }

// // Call the asynchronous function
// readFileAsync();

app.get("/search", async (req, res) => {
  console.log(req.query.searchItem);
    // Check if the required parameter is missing
  if (!req.query.searchItem) {
    return res.status(400).json({ error: "Missing required parameter:searchItem" });
  }
  const searchTerm = req.query.searchItem;

  try {
    // Use Promise.all to handle both API calls and scraping
    let outputFolder;

    const shallowSearchPromises = [];
    const keyQuery = {};

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    outputFolder = path.join(__dirname, "screenshots", encodedSearchTerm);
  await fs.rm(outputFolder, { recursive: true, force: true });
    // // Create directory if it doesn't exist
    // if (!fsNoPromise.existsSync(outputFolder)) {
    //   await fs.mkdir(outputFolder, { recursive: true });
    // }
    const encodedKeywordTerm =  encodeURIComponent(`${searchTerm} born on 29 March 1952`);
    await fs.mkdir(outputFolder, { recursive: true });
    for (const index in searchArray) {
      const encodedQuery = encodeURIComponent(searchArray[index]);
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchId}&q=${encodedKeywordTerm}%20${encodedQuery}`;
      shallowSearchPromises.push(axios.get(url));
      keyQuery[index] = searchArray[index];
    }

    const shallowSearchResults = await Promise.all(shallowSearchPromises);
    console.log(shallowSearchResults);
    let combinedArray = [];
    for (const index in shallowSearchResults) {
      const responseData = shallowSearchResults[index];
      const searchResults = responseData.data.items
        .map((profile) => {
          return {
            fullNames: extractName(profile.title),
            sourceLink: profile.link,
            pictures: [
              ...(Boolean(profile?.pagemap?.cse_thumbnail) === true
                ? profile?.pagemap?.cse_thumbnail?.map((data) => data.src)
                : []),
              ...(Boolean(profile?.["pagemap"]?.["metatags"]) === true
                ? profile?.["pagemap"]?.["metatags"].map(
                    (data) => data["og:image"]
                  )
                : []),
              ...(Boolean(profile?.pagemap?.cse_image) === true
                ? profile?.pagemap?.cse_image?.map((data) => data.src)
                : []),
            ],
            searchItemType: profile.searchItemType,
          };
        })
        .filter((data) => data.fullNames !== null)
        .map((data) => {
          return {
            ...data,
            fullNames: data.fullNames,
            dataType: keyQuery[index],
          };
        });

      combinedArray = [...combinedArray, ...searchResults];
    }
    for (const index in combinedArray) {
      const obj = combinedArray[index];
      if (index > 10){
        break
      }
      if (obj.sourceLink) {
        scrapeSite(obj.sourceLink, outputFolder, obj.dataType);
        // console.log(obj)
      }
    }
    
    res.status(200).json(combinedArray);
    await main();

    // searchArray.map(async (query) => {
    //   const encodedSearchTerm = encodeURIComponent(searchTerm);
    //   outputFolder = path.join(__dirname, "screenshots", encodedSearchTerm);
    //   // Create directory if it doesn't exist
    //   if (!fsNoPromise.existsSync(outputFolder)) {
    //     await fs.mkdir(outputFolder, { recursive: true });
    //   }

    //   const encodedQuery = encodeURIComponent(query);
    //   const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchId}&q=${encodedSearchTerm}%20${encodedQuery}`;

    //   console.log(url);

    //   const apiResponse = await axios.get(url);
    //   const responseData = apiResponse.data;

    //   const searchResults = responseData.items
    //     .map((profile) => {
    //       return {
    //         fullNames: extractName(profile.title),
    //         sourceLink: profile.link,
    //         pictures: [
    //           ...(Boolean(profile.pagemap.cse_thumbnail) === true
    //             ? profile.pagemap.cse_thumbnail.map((data) => data.src)
    //             : []),
    //           ...(Boolean(profile?.["pagemap"]["metatags"]) === true
    //             ? profile?.["pagemap"]["metatags"].map(
    //                 (data) => data["og:image"]
    //               )
    //             : []),
    //           ...(Boolean(profile.pagemap.cse_image) === true
    //             ? profile.pagemap.cse_image?.map((data) => data.src)
    //             : []),
    //         ],
    //         searchItemType: profile.searchItemType,
    //       };
    //     })
    //     .filter((data) => data.fullNames !== null)
    //     .map((data) => {
    //       return { ...data, fullNames: data.fullNames };
    //     });

    //   resultsArray.push(searchResults);
    //   console.log(`API call for '${query}' successful`);
    // });

    // Iterate through the array of arrays and scrape each site
    // for (const array of resultsArray) {
    //   for (const obj of array) {
    //     console.log(obj.sourceLink);
    //     if (obj.sourceLink) {
    //       await scrapeSite(obj.sourceLink);
    //     }
    //   }
    // }

    // const screenshotPromises = [];
    // for (const array of resultsArray) {
    //   for (const obj of array) {
    //     console.log(obj.sourceLink);
    //     if (obj.sourceLink) {
    //       screenshotPromises.push(scrapeSite(obj.sourceLink, outputFolder));
    //     }
    //   }
    // }

    // await Promise.all(screenshotPromises);
    // main();

    // Respond with the final results if needed
    // res.status(200).json(resultsArray);
  } catch (error) {
    console.error("Error during API calls:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
