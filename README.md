# Automation Workable Alert App

This application interfaces with the Sequencer to find all instances of available jobs and sends an alert to Discord if a Maker job hasn't been worked for 10 consecutive blocks.

## Configuration

The application requires the following environment variables to be set:

- `PROVIDER_URL`: The URL of the Ethereum provider.
- `DISCORD_BOT_TOKEN`: The token of the Discord bot.
- `DISCORD_CHANNEL_ID`: The ID of the Discord channel where alerts will be sent.

Make sure to provide these variables either in the `.env` file for local execution or in the Lambda function settings for deployment.


## Running the Application Locally

1. Clone the repository:
```bash
git clone https://github.com/jahabeebs/automation-workable-alert-app.git
```

2. Install the dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the environment variables specified in the `.env.example` file.
4. Build the application:
```bash
npm run build
```
5. Run the application:
```bash
npm start
```

6. Run tests
```bash
npm test
```

## Deploying to AWS Lambda

1. Follow the steps mentioned in the local deployment instructions above to output a dist folder.

2. Zip the *contents* of the dist folder (don't just upload the dist folder) + node_modules (before zipping ensure there is no index.js or index.mjs to avoid CommonJS/ES6 compatibility issues). Go to the AWS Management Console and navigate to the Lambda service.

3. Click on "Create Function" and choose "Author from scratch".
   
4. Enter a name for your function, e.g., "automation-workable-alert-app".
   
5. Choose the runtime as "Node.js" and select an execution role.
   
6. Click on "Create Function".
   
7. In the function configuration, scroll down to the "Function code" section.
   
8. Select "Upload from" and select a .zip file as the code entry type and upload the automation-workable-alert-app.zip file.

9. Make sure to configure the necessary environment variables in the Lambda function settings.

10. Set the trigger for the Lambda function (like CloudWatch Events) to run it periodically.

## Setting up the Discord Bot

1. Go to the Discord Developer Portal and create a new application.

2. Go to the "Bot" tab and click on "Add Bot".

3. Copy the token and set it as the `DISCORD_BOT_TOKEN` environment variable.

4. Go to the "OAuth2" tab and select the "bot" scope.

5. After you select the bot you'll be able to set a number of other bot scopes. Set the right permissions. You'll at least need "View Channels" and "Send Messages". 
In discordService.ts we're initializing the client with an intent of 8 for convenience (Administrator privilege). However, you can calculate the intent value in Discord's developer portal based on the permissions you need.

6. Install the bot in your server by using the generated URL in the "OAuth2" tab.

## License

This project is licensed under the ISC License.
