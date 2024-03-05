# Wati Broadcast

This is a Node.js project that allows you to send broadcast messages to WhatsApp using the WatiBrodcast API.

## Prerequisites

- Node.js (version 12 or later)
- A WatiBrodcast account with API credentials

## Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. Install the required dependencies by running:

```
npm install
```

## Configuration

1. Create a new file called `demo.csv` in the project directory.
2. Add the phone numbers (with country codes) of the recipients you want to send the broadcast message to, one per line.
3. Open the `config.js` file and modify the following properties according to your requirements:
   - `csvFilePath`: Path to the `demo.csv` file you just created.
   - `messageText`: The message you want to send.
   - `templateName`: The name of the template you want to use for the message.
   - `broadcastName`: The name of the broadcast.
   - `useImage`: Set to `true` if you want to include an image with the message, `false` otherwise.
   - `imageUrl`: The URL of the image you want to include (only applicable if `useImage` is `true`).
   - `watServerIdMapping`: This object contains the API URLs and access tokens for different server IDs. You need to update the `accessToken` values with your actual WatiBrodcast API credentials.

## Usage

To start the broadcast, run the following command:

```
npm start
```

or

```
npm run dev
```

The script will read the phone numbers from the `demo.csv` file and send the specified message to each recipient using the WatiBrodcast API.

## Dependencies

This project uses the following dependencies:

- `axios`: For making HTTP requests to the WatiBrodcast API.
- `csv-parser`: For parsing the CSV file containing the recipient phone numbers.
- `fs`: For file system operations.
- `path`: For working with file paths.
- `readline`: For reading input from the console.
