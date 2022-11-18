
const chalk = require('chalk');

const getEllipsisTxt = (str, n = 6) => {
  if (str) {
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
  }
  return "";
};
const fancylog = (str, bracketedStr, tokenAddress, spinner) => {
  if (spinner){
    spinner.stop();
  }

  if (str) {
    if (bracketedStr) {
      switch (bracketedStr){
        case 'moralis':
          red = 0;
          green = 255;
          blue = 0;
          break;
        case ' mongo ':
          red = 255;
          green = 255;
          blue = 0;
          break;
        case 'error':
          red = 255;
          green = 0;
          blue = 0;
          break;
        case 'system ':
          red = 0;
          green = 255;
          blue = 255;
          break;
        default: 
          red = 255;
          green = 255;
          blue = 255;
          
      }

      if (tokenAddress){
        return console.log(`  [ `+Date().substr(15,9)+` ] `+"[" + chalk.bold.rgb(red, green, blue)(bracketedStr) + "]"+' '+"[" + chalk.bold.rgb(0,255,0)(getEllipsisTxt(tokenAddress,3)) + "]"+'  '+`${str}`);
      }else {
        return console.log(`  [ `+Date().substr(15,9)+` ] `+"[" + chalk.bold.rgb(red, green, blue)(bracketedStr) + "] "+`${str}`);
      }
    }else {
      return console.log(`  [ `+Date().substr(15,9)+` ] ${str}`);
    }
  }


  return "";
};

exports.fancylog = fancylog;
exports.getEllipsisTxt = getEllipsisTxt;



