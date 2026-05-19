const fs = require("fs");

let guilds = require("./guild.json");

guilds.save = () => {
  fs.writeFileSync(
    "./data/guilds.json",
    JSON.stringify(guilds, null, 2)
  );
};

module.exports = guilds;
