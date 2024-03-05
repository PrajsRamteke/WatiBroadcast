const axios = require("axios");
const csv = require("csv-parser");
const fs = require("fs");
const path = require('path');
const config = require('./config');
const readline = require('readline');


// ===============Configuration=======================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showConfig() {
  console.log('-----------Please check the following configuration-----------');
  console.log('csvFilePath:', config.csvFilePath);
  console.log('messageText:', config.messageText);
  console.log('templateName:', config.templateName);
  console.log('broadcastName:', config.broadcastName);
  console.log('useImage:', config.useImage);
  console.log('--------------------------------------------------------------');
}

function askConfirmation() {
  rl.question('Do you want to proceed with the current configuration? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      rl.close();
      sendTemplateMessageForEndpoint();
    } else {
      console.log('Exiting...');
      rl.close();
    }
  });
}
showConfig();
askConfirmation();
// =================================================

// sendTemplateMessageForEndpoint();

async function sendTemplateMessageForEndpoint() {
  const phonePosterMap = await readCSV(`./csv/${config.csvFilePath}`);
  const numbers = Object.keys(phonePosterMap);
  const batchesWithReceivers = chunkArray(numbers, phonePosterMap, 5000);

  try {
    await Promise.all(batchesWithReceivers.map(async (batchInfo) => {
      const { batch, data } = batchInfo;
      const watiserverid = phonePosterMap[batch[0]].watiserverid;
      const { apiUrl, accessToken } = config.watServerIdMapping[watiserverid];

      try {
        const response = await axios.post(apiUrl, data, {
          headers: { Authorization: accessToken },
          timeout: 300000,
        });
        await sleep(30 * 1000);
        if (response.status >= 200 && response.status < 300) {
          const currentDate = new Date();
          console.log(`Batch sent successfully on watiserverid:${watiserverid} Response: ${response.data.result} BatchNumbers: ${batch.length} at Time: ${currentDate.toLocaleString()}`);
        } else {
          console.error(`Error sending batch - watiserverid:${watiserverid}, batch:${JSON.stringify(batch)}, error:`, error.message);
        }   
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          console.error(`Error sending batch on: ${watiserverid}`, error.response.data.error);
        } else {
          console.error(`Error sending batch on: ${watiserverid} `, error.message);
        }
      }
    }));
  } catch (error) {
    console.error(`Error sending batches: ${watiserverid} `, error.message);
  }
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const phonePosterMap = {};
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        phonePosterMap[row.phone] = { name: row.name, watiserverid: row.watiserverid };
      })
      .on("end", () => {
        resolve(phonePosterMap);
      })
      .on("error", (error) => {
        reject(`Error reading CSV file: ${error.message}`);
      });
  });
}

function chunkArray(array, phonePosterMap, batchSize) {
  const result = [];

  const groupedNumbers = array.reduce((groups, number) => {
    const watiserverid = phonePosterMap[number].watiserverid;
    const stringNumber = number.toString();
    if (!groups[watiserverid]) {
      groups[watiserverid] = [];
    }
    groups[watiserverid].push(stringNumber);
    return groups;
  }, {});

  for (const watiserverid in groupedNumbers) {
    const numbers = groupedNumbers[watiserverid];
    const chunkedNumbers = chunkArrayForBatchSize(numbers, batchSize);

    for (const chunk of chunkedNumbers) {
      const receivers = chunk.map((number) => {
        const name = phonePosterMap[number].name;
        const watiserverid = phonePosterMap[number].watiserverid;
        return {
          whatsappNumber: number,
          customParams: [
            {
              name: "message",
              value: config.messageText
            },
            ...(config.useImage ? [{
              name: "image",
              value: config.imageUrl
            }] : []),
            {
              name: "name",
              value: name,
            }
          ],
          watiserverid: watiserverid,
        };
      });

      const data = {
        template_name: config.templateName,
        broadcast_name: config.broadcastName,
        receivers: receivers,
      };

      result.push({ batch: chunk, data });
    }
  }

  return result;
}

function chunkArrayForBatchSize(array, batchSize) {
  const result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}