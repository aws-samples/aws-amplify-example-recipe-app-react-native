# Sample Mobile Application from AWS Developers Let's Build session

## Things to note about this repository

The repo is divided into a number of different branches, each branch is an episode of the Developers Let's Build series on Building a Mobile Application.

You can view the full series at https://summit-emea.virtual.awsevents.com/track_builders_zone_en/210384263/Let%27s+Build+Series  
Note: This series was part of EMEA AWS Summit 2021 - so to view you will need to register. 

Branch Structure:

\main - The initial scaffold for the application 
                  
\auth - adding authentication and authorisation 
                 
\api-db - adding an GraphQL API and storage
                  
\photos - adding photo upload/download.
                  
## Steps to build and run each branch  
Note: this project is roughly based on https://docs.amplify.aws/start/getting-started/installation/q/integration/react-native - please refer here if you get stuck building and deploying / running the project.

1. Clone this repo into a directory of your choosing
2. This project uses AWS Amplify, so if you haven't already please install the Amplify CLI -> https://docs.amplify.aws/cli
3. Run 'amplify configure' and 'amplify init' to re-configure the project to a new cloud back end in your own AWS account.
4. As this is a react-native project you can then either 'npx react-native run-ios' or 'npx react-native run-android' to deploy to the emulator of choice.
