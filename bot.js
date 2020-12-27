"use strict";
let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
let key_file = require('./key.json');
const fetch = require('node-fetch');
const fs = require('fs');


let baseItems = {};
try {
    baseItems = require('./baseItems.json');
    baseItems.reforges = baseItems.reforge_string.split(" ");
    console.log(baseItems);
    console.log("Base items successfully loaded.");
} catch(error) {
    console.log("Base items failed to load. Defaulting to abbreviated list");
    baseItems.tiers = ["- Tier III","- Tier II", "- Tier IV", "- Tier IX", "- Tier I", "- Tier VIII", "- Tier VII", "- Tier VI","- Tier V","- Tier XII", "- Tier XI","- Tier X"];
    let reforge_string = "Very Highly Extremely Absolutely Perfect Gentle Odd Fast Fair Epic Sharp Heroic Spicy Legendary Fabled Suspicious Gilded Salty Treacherous Deadly Fine Grand Hasty Neat Rapid Unreal Awkward Rich Precise Spiritual Clean Fierce Heavy Light Mythic Pure Smart Titanic Wise Necrotic Spiked Renowned Cubic Warped Reinforced Loving Ridiculous Bizarre Itchy Ominous Pleasant Pretty Shiny Simple Strange Vivid Godly Demonic Forceful Hurtful Keen Strong Superior Unpleasant Zealous Silky Bloody Fruitful Magnetic";
    baseItems.reforges = reforge_string.split(" ");
    baseItems.bases = ["Dragon Helmet","Dragon Chestplate","Dragon Leggings","Dragon Boots","Helmet","Chestplate","Leggings","Boots"];
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', parseMessage);

//Initialize batches + api key from batches.txt and key.json
let api_key = key_file.api_key;
let batches = []; //contains an array of all batches
loadBatches(); //loads batches from batches.txt

//Processes messages sent in any discord text channel that the bot has access to.
function parseMessage(user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let command = args[0];
        args = args.splice(1);
        let staticID = findStaticChannelID(channelID); //finds the ID of the static channel
        
        switch(command){
            case('snipe'): //Finds items below a specified threshold and prints them in the channel
                snipe(channelID);
                break;
            case('watch'): //
                console.log("Watch activated...");
                watch(channelID);
                break;  
            case('display'):
                if(channelID === staticID){
                    displayStaticBot(staticID);
                }
                break;
            case('track'): //add a batch to the tracking channel
                    trackBatch(channelID,args[0]);
                    break;
            case('untrack'): //remove a batch from the tracking channel
                console.log(args[0]);
                untrackBatch(channelID,args[0]);
                break;
            case('create'): //create a new batch
                let batchFormat = message.substring(1).split(' | ');
                //!create | f6 | ["lapis","fireball","lazuli"] | ah
                createBatch(channelID,batchFormat);
                break;
            case('remove'):
                removeBatch(channelID,args[0]);    
                break;
            case('list'): //Prints the names of all available batches
                bot.sendMessage({to:channelID, message: listBatches(channelID)});
                break;
            case('help'):
                let helpStr = "Available commands: create, remove, track, untrack, list, help";
                bot.sendMessage({to:channelID, message: helpStr});
                break;
        }      
    }
}

/**
 * Snipe(!snipe) Command:
    * Checks all pages of the Skyblock Auction House using the Hypixel API for items below the specified max price.
    * When a match is found, a message is sent to the discord text channel where the function was called with the
    * time, item name, price, and percentage below max price.
 * 
 * Example output:
 * [13:24:36]  Wither Shield: 71,499,999(-11%)
 */
async function snipe(channelID){ 
    let base_url = 'https://api.hypixel.net/skyblock/auctions?key=' + api_key + '&page='; //add page num at the end
    let watchList = ["Implosion","Wither Shield","Shadow Warp","Necron's Handle"];
    let max_price = {
        "Implosion": 76000000,
        "Wither Shield": 75600000,
        "Shadow Warp": 75600000,
        "Necron's Handle": 342000000
  };
  //additionally check to make sure it's looking at EVERYTHING in the AH
  while(true){
    let initialResponse = await fetch(base_url + "1");
    if(initialResponse.ok){
        const json = await initialResponse.json();
        let totalPages = json.totalPages
        for(let i = 0;i<totalPages;i++){
            let currPage = base_url + i;
            const response = await fetch(currPage);
            if(response.ok){
            let pageData = await response.json();
            totalPages = pageData.totalPages;
            processSnipeArray(max_price,pageData.auctions,watchList,channelID); //Called on each page of the auction house
            }
            console.log(i);
        }
    }
    await new Promise(r => setTimeout(r, 35000));
  }    
}

function printItemSnipe(item_name,item_price,max_price,channelID){
    let today = new Date();
    let printStr = "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "] ";
    if(item_name in max_price){
        let expected_price = max_price[item_name];
        let percentage = Math.floor((item_price/expected_price * 100) - 100) + "%";
        printStr = printStr + " " + item_name + ": " + item_price.toLocaleString('en') + "(";
        if(item_price < expected_price[item_name]){
            printStr = printStr + "-";
        }
        printStr = printStr + percentage + ")" + "\n";
        bot.sendMessage({to: channelID, message: printStr});
   }
}

/**
 * @param max_price: Object with key-value pairs of the form String:number representing the name of an item and the maximum price for consideration.
 * @param auctions: Array of auctions from the Hypixel API 
 * @param channelID: The discord text channelID where the print message will be sent. 
 */
function processSnipeArray(max_price,auctions,watchList,channelID){
    for(let j = 0;j<auctions.length;++j){ //Analyze the first 100 auctions
        let auction = auctions[j];
        if(auction.hasOwnProperty('bin')){ //only assessing BIN auctions
            let item_name = getBaseItem(auction.item_name);
            let item_price = auction.starting_bid;
            for(let watched of watchList){
                if(watched === item_name){
                    if(max_price[watched] > item_price){ printItemSnipe(item_name,item_price,max_price,channelID);}
                }
            }
        }
    }
}


/**
 * Helper function for watch()
 * Prints the first five prices for the tracked items.
 */
async function printWatch(allAuctions,channelID){
    let printStr = `\`\`\`CS\nTracked Batches: ${listBatches()}\nLast Updated ${new Date().toLocaleString()}\n\`\`\``;
    for(let batch of batches){
        if(batch.track){
            printStr += "**" + batch.name + "**\n\`\`\`CSS\n"; //adds batch name in bold
            for(let item_name of batch.items){
                if(checkedItems.includes(item_name)){
                    let itemIndex = checkedItems.indexOf(item_name);
                    let auction = allAuctions[itemIndex];
                    printStr += auction.name + ": \n"
                    auction.itemArray.sort((a,b) => (a.price-b.price)); //sort itemArray in ascending order by price
                    let displayItems = auction.itemArray.slice(0,5); //creates shortened copy of item array for listing(lowest 5 prices)
                    for(let item of displayItems){
                        printStr += "    " + item.price.toLocaleString('en');
                        try{
                            let mojang_url = "https://api.mojang.com/user/profiles/" + item.auctioneer + "/names";
                            let response = await fetch(mojang_url);
                            if(response.ok){
                                let json = await response.json();
                                printStr += " /ah " + json[json.length-1].name;
                            } 
                        }catch{
                            console.log("UUID->Name request failed");
                        }
                        printStr += "\n";
                    }
                }
            }
            printStr += `\`\`\``;
            if(printStr.length > 1000){ //Prevents the discord message from exceeding the 2000 character limit.
                bot.sendMessage({to: channelID, message: printStr});
                printStr = "";
            }
        }
    }
    bot.sendMessage({to: channelID, message: printStr});
}

let allAuctions = [];
let checkedItems = [];

/**
 * allAuctions.f6["item_name"]
 * checkedItems.f6["item_name"]
 */

//formerly checkValue
async function watch(channelID){
    //let watchList = ["[Lvl 63] Spider","Necron's Handle", "Ender Artifact", "Aspect of the End", "Leaping Sword", "Wise Dragon Chestplate"];
    //load the watchList from the batches
    let watchList = [];
    for(let batch of batches){
        for(let item of batch.items){
            watchList.push(item);
        }
    }
    console.log(watchList);
    if(watchList.length > 0){
        bot.sendMessage({to:channelID, message: `Finding lowest prices for ${watchList.length} items...`});
    }

    let totalPages = 1;
    for(let i = 0;i<totalPages;i++){
        console.log("Currently working on page " + i + " of watch()");
        let currPage = 'https://api.hypixel.net/skyblock/auctions?key=' + api_key + '&page=' + i;
        fetch(currPage).then(res => res.json()).then(json => assessData(json));
        await new Promise(r => setTimeout(r, 250));
    }
    printWatch(allAuctions,channelID);
  
    function assessData(json){
        totalPages = json.totalPages;
        let auctions = json.auctions;
        //console.log(getTime(json.lastUpdated));
        for(let j = 0;j<auctions.length;++j){ //Analyze the first 100 auctions
            assessAuction(auctions[j],watchList);
        }
    }
}
  
  //should run but missing batch tracking
  /**
   * Takes an auction as input and validates whether it matches the following criteria:
   * The specified auction is up for BIN (done)
   * The specified auction is part of a tracked batch (incomplete)
   */
function assessAuction(auction,watchList){
    let item_name = getBaseItem(auction.item_name);
    if (watchList.includes(item_name)){
        //console.log(item_name);
        if(auction.hasOwnProperty('bin')){ //only assessing BIN auctions
            if(!checkedItems.includes(item_name)){
                let itemArray = [];
                itemArray.push({
                    price: auction.starting_bid,
                    auctioneer: auction.auctioneer,
                    bin: auction.hasOwnProperty('bin')
                });
                allAuctions.push({name: item_name,itemArray: itemArray});
                checkedItems.push(item_name);
            }
            else{
                let itemIndex = checkedItems.indexOf(item_name);
                allAuctions[itemIndex].itemArray.push({
                    price: auction.starting_bid,
                    auctioneer: auction.auctioneer,
                    bin: auction.hasOwnProperty('bin')
                });
            }
            }
    }
}
  
  
  class Auction{ //Perfect Chestplate, array of item values
    constructor(name,itemArray){
      this.name = name;
      this.itemArray = itemArray;
    }
  }


/**
 * getBaseItem() Helper Function:
 * Removes any item upgrades/modifications from the name of an item so that it can be compared to other items
    * Items frequently have upgrades that alter the name of the item without changing the base item, so this function allows
    * the bot to use string matching to check for identical base items when performing price checking since item value is generally
    * determined by the base item rather than upgrades.
 */
function getBaseItem(item_name){
    let tiers = baseItems.tiers;
    let reforges = baseItems.reforges;
    let bases = baseItems.bases;

    //Step 1: Remove Stars from Dungeon Items (i.e. Hyperion ✪✪)
    let curr_name = item_name;
    curr_name = curr_name.replace(/✪*/g,"");

    //Step 2: Remove Tiers from Perfect Armor (i.e. Perfect Armor - Tier IV)
    for(let i = 0; i<tiers.length; i++){
      curr_name = curr_name.replace(tiers[i],"");
    }

    //Step 3: Remove reforges left to right, comparing the item against the valid bases at each iteration.
    //There exist valid base item names that contain words used in reforges, which is why this is necessary.
    let old_name = "";
    while(old_name != curr_name){
      old_name = curr_name;
      for(let i = 0; i<reforges.length; i++){
        let short = curr_name.replace(reforges[i],"").trim();
        if(short != curr_name){
          if(bases.includes(short)){
            return curr_name;
          }
          else{
            curr_name = short;
          }
        }
      }
    }
    return curr_name;
  }




//Finds the ID of the static channel
function findStaticChannelID(){
    for(let id in bot.channels){
        if(bot.channels[id].name === "static_bot"){
            console.log("Static channel found, id: ", id);
            return id;
        }
    }
}

/**
 * 
```CSS
Tracked Batches
  Last Updated 9/16/2020 @ 2:20 PM
```
**F6**
```C
Shadow Assassin Chestplate: 2000
Explosive Bow: 2,000,000
Precursor Eye: 5,500,000
```
 */

function displayStaticBot(channelID){
    let staticStr = `
    \`\`\`CS\nTracked Batches: ${listBatches()}\nLast Updated ${new Date().toLocaleString()}\n\`\`\``;
    for(let batch of batches){
        if(batch.track === true){
            staticStr += "**" + batch.name + "**\n\`\`\`CSS\n";
            for(let item of batch.items){
                staticStr += `${item}: \n`;
            }
            staticStr += `\`\`\``;
        }
    }
    bot.sendMessage({to:channelID, message: staticStr});
}


//Define a batch to be an object of the following form
/**
 * batch{
 *   name = "f6"
 *   items = ["item1","item2", "item3"],
 *   track = true,
 *   type = "ah"
 * }
*/

//Files:
 //batches.json: holds all of the batches in storage as an array of stringified batch objects

function getBatch(name){ //returns batch or undefined if no batch found
    for(let batch of batches){
        if(batch.name === name){
            return batch;
        }
    }
    return undefined;
}

//Enables a batch for tracking
function trackBatch(channelID,name){
    let batch = getBatch(name);
    if(batch){ //checks if the batch exists
        if(batch.track){
            bot.sendMessage({to:channelID, message: `${name} is already tracked`});
        }
        else{
            batch.track = true;
            updateBatchFile();
            bot.sendMessage({to:channelID, message: `${name} is now being tracked`});
        }
    }
    else{
        bot.sendMessage({to:channelID, message: "The batch doesn't exist."});
    }
}

//Removes the batch from being tracked
function untrackBatch(channelID,name){
    let batch = getBatch(name);
    if(batch){ //checks if the batch exists
        if(!batch.track){
            bot.sendMessage({to:channelID, message: `${name} is already not tracked`});
        }
        else{
            batch.track = false;
            updateBatchFile();
            bot.sendMessage({to:channelID, message: `${name} is no longer being tracked`});
        }
    }
    else{
        bot.sendMessage({to:channelID, message: "The batch doesn't exist."});
    }
}

//Creates a new batch given user input in the following format;
//!create | f6 | ["lapis","fireball","lazuli"] | ah
function createBatch(channelID,batchFormat){
    if(batchFormat.length < 3){
        bot.sendMessage({to:channelID, message: "Invalid format. Please enter a create command of the following format:\n !create | batch_name | [item1,item2] | type\n Valid types: ah, bazaar"});
    }
    else if (batchFormat[3] !== "ah" && batchFormat[3] !== "bazaar"){
        bot.sendMessage({to:channelID, message: "Invalid batch type."});
    }
    else{
        let newBatch = {
            name: batchFormat[1],
            items: JSON.parse(batchFormat[2]),
            track: true,
            type: batchFormat[3]
        };
        batches.push(newBatch); 
        bot.sendMessage({to:channelID, message: "Batch successfully created.\n" + JSON.stringify(newBatch,null,2)});
        updateBatchFile();
    }
}

function removeBatch(channelID,name){
    for(let i = 0; i < batches.length; i++){
        let batch = batches[i];
        if(batch.name === name){
            batches.splice(i,1); //remove the batch
            bot.sendMessage({to:channelID, message: "Batch successfully removed."});
            updateBatchFile();
            return;
        }
    }
    bot.sendMessage({to:channelID, message: "Batch not found."});
}

//Lists the names of all available batches.
function listBatches(channelID){
    let batch_names = [];
    batches.forEach((item) => batch_names.push(item.name));
    return batch_names.join(", ");
}

//Loads all of the batches from file.txt into allBatches and currBatches.
function loadBatches(){
    let batch_data = fs.readFileSync('./batches.txt');
    batches = JSON.parse(batch_data);
    console.log(batches);
}

function updateBatchFile(){
    fs.writeFileSync('./batches.txt',JSON.stringify(batches));
}

