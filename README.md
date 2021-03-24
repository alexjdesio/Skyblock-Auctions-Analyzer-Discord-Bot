# Skyblock Auctions Analyzer

Skyblock Auctions Analyzer is a lightweight Discord Bot for parsing Auction House JSON data.

# Commands
  - **Snipe**(!snipe)- Regularly checks the auction house and notifies users of chosen items below a specified price point.
  - **Watch**(!watch)- Finds the five cheapest BIN listings for all items contained within tracked batches, and publishes a comprehensive report of item prices every time the command is called.
  - **Find**(In Development)- Finds the lowest five prices for a single item when called.

# Batches

Batches allow users to create groups of items to collectively track. This improves ease of use and allows users to quickly customize the bot's configuration based on new updates/items of interest without needing to change any code or external files. Common batches include Floor 7, Slayer, and Fishing, but the possibilities are endless!

## Batch Commands
  
| Command| Arguments | Functionality | Example |
| --| --------| ---- | ---- |
| **!create** | <batch_name> <item_array> <ah/bazaar> | Creates a new batch and automatically sets it to be tracked by default. When running this command, make sure that the item array has syntax as provided in the example. | !create \| f7 \| ["lapis","fireball","lazuli"] \| ah |
| **!remove** | <batch_name> | Deletes the specified batch. | !remove f6 |
| **!track** | <batch_name> | Enables tracking for the specified batch.  | !track f6 |
| **!untrack** | <batch_name> | Disables tracking for the specified batch.| !untrack f6 |
| **!list** | <batch_name> | Lists all available batches. | !list |
| **!help** | None | Lists all available batch commands. | !help |

# FAQs

- **Q**: Can I use this bot without downloading or running any code?
  - **A**: As of the initial release, you must download the provided code to make use of the bot. In addition, you must have a valid authentication token for a discord bot from https://discord.com/developers/applications. This is because the bot does not have distinct settings for individual users, and as such, would be difficult to deploy on multiple servers/for multiple users at the same time. This is only applicable for the initial release, and I intend to work on this in the future.
- **Q**: I tried to run the bot, but I ran into an issue. What should I do?
  - **A**: Please feel free to reach out via the [issue queue](https://github.com/alexjdesio/Skyblock-Auctions-Analyzer-Discord-Bot/issues). I read all requests posts in the issue queue and will do my best to respond promptly. If you had an issue with running the bot prior to March 22, please download the newest release as the port from discord.io to discord.js resolved many of the common issues users were encountering.
- **Q**: What features are planned for future releases?
   - **A**:  I have a lot planned! Right now, the top priorities are releasing **!find**, improving the speed of the bot, caching results to prevent repeated work, and improving the batch creation command.
- **Q**: How will this project scale?
  - **A**: As of v0.1, there is no concrete backend for this project. Scaling would require interaction with a database so that individual users could have their own list of batches and track/untrack batches just for themselves. The other key component to scaling this project is hosting it on a dedicated web server(i.e. Heroku, AWS, etc.). As soon as these two constraints are met, the bot can be officially released to the public and users will be able to add the bot to their servers without needing to set up their own version of the bot.
- **Q**: Are there any other similar projects planned?
  - **A**: Once the backend is set up, the possibilities are endless. It would be very easy to take the information being processed for the discord bot and make it accessible on a website, which would greatly reduce the amount of effort required to get started. While I do not have any other future projects planned at this time, I have lots planned for the development of this bot. 

## Screenshots

Here are some images to give you a sense of what this bot is capable of:

<img src="https://i.imgur.com/8olZ3Iq.png">
<img src="https://i.imgur.com/tmgFqto.png">

## Getting Started
- As a first step, download the most recent .zip from the main branch.
- Once you have extracted the .zip file to a folder, take this opportunity to create auth.json and key.json. You will need to get a valid authentication token for a discord bot from https://discord.com/developers/applications. Your Hypixel API key can be obtained by connecting to mc.hypixel.net and using the command /api
  - The necessary files section directly under this section will show the correct formatting for the key.json and auth.json files
  - Please note that the Hypixel API has a limit of 120 queries per minute. It is your responsibility to act responsibly when instructing the bot to perform large-scale queries on the API or your API key will be reset or banned. There are currently ~70 pages on the auction house, so a single request to !watch makes 70 queries. Queries that are repeated within 3 minutes of a previous valid request are cached to help reduce the total number of queries and should ensure that under normal user behavior the key limit should not be reached.
- Download and install [Node](https://nodejs.org/en/download/) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Run the bot using node bot.js after navigating to the correct folder using the command line or terminal.
  - It is possible that you will be missing some dependencies at this step. If this is the case, you can run the command "npm install x" to install each dependency separately. Replace the x in the command with each of the following dependencies(i.e. "npm install discord.js"):
     - discord.js
     - node-fetch
     - fs
     - winston
- The bot is now ready! Feel free to start with !find, !watch, or by setting up custom batches. Snipe is currently an advanced command and requires basic string editing inside of bot.js. This will be changed in future releases.


## Necessary Files
If you want to run this bot on your own Node.js server, you need to create the the following files:
- auth.json- This should contain your Discord Authentication key.
- key.json- This should contain your Hypixel API key.

The format for the necessary files is as follows:
For auth.json:
{
  "token": "your_token_goes_here"
}

For key.json
{
  "api_key": "your_key_goes_here"
}


## Changelog
- **v0.1- Initial Release**
  - Initial release of Skyblock Auctions Analyzer, with !watch, !snipe, and batch commands.
- **v0.1.1- Enchanted Book Support**
  - Added support for enchanted books to !watch and !snipe
- **v0.1.2- Caching, !find**
  - !watch and !find now support caching, which means that requests within 3 minutes of a previous valid request will use the auction house data of the previous request. This reduces repeated strain on the Hypixel API and helps keep high volume requests within the key limit while also greatly improving speed.
  - !find- Search for a single item extremely quickly and get a breakdown of the 5 cheapest listings and their owners. When combined with caching, this is very useful for quickly finding items.
- **v0.1.3- Star Support, port to discord.js, Getting Started, general bugfixes**
  - The bot now supports queries with stars. To search for "Wither Chestplate ✪✪✪✪✪", instead use the name "Wither Chestplate 5star".
  - The bot has been fully ported to discord.js from discord.io. This should resolve many of the common issues users were encountering when trying to set up the bot.
  - The README now has a section describing the full process of getting started.
  - !watch now appropriately handles messages of excessive length.


