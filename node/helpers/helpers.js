const chalk = require('chalk');


exports.getEllipsisTxt = (str, n = 6) => {
    if (str) {
      return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
    }
    return "";
  };

exports.bullets = (str) => {
    if (str) {
      return console.log(chalk.bold.rgb(0,255,0)(` ♣`)+`\t[ `+Date().substr(15,9)+` ]\t${str}`);
    }
    return "";
  };