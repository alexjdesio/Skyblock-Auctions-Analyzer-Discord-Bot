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
  - **A**: As of the initial release, to make use of this bot you must have a valid authentication token for a discord bot from https://discord.com/developers/applications. This is because the bot does not have distinct settings for individual users, and as such, would be difficult to deploy on multiple servers/for multiple users at the same time. This is only applicable for the initial release, and I intend to work on this in the future.
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

## Necessary Files
If you want to run this bot on your own Node.js server, you need to create the the following files:
- auth.json- This should contain your Discord Authentication key.
- key.json- This should contain your Hypixel API key.


## Changelog
- **v0.1- Initial Release**
  - Initial release of Skyblock Auctions Analyzer, with !watch, !snipe, and batch commands.
- **v0.1.1- Enchanted Book Support**
  - Added support for enchanted books to !watch and !snipe


