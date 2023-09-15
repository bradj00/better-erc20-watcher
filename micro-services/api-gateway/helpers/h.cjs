
const chalk = require('chalk');
// import chalk from 'chalk'; 

const getEllipsisTxt = (str, n = 6) => {
  if (str && typeof str === 'string') { 
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
        case ' error ':
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

      if (tokenAddress && tokenAddress != '' && typeof tokenAddress == 'string') {
        return console.log(`  [ `+Date().substr(15,9)+` ] `+"[" + chalk.bold.rgb(red, green, blue)(bracketedStr) + "]"+' '+"[" + chalk.bold.rgb(( parseInt(tokenAddress.substr(3,8), 16) % 255 ),( parseInt(tokenAddress.substr(9,13), 16) % 255 ),( parseInt(tokenAddress.substr(14,19), 16) % 255 ))(getEllipsisTxt(tokenAddress,3)) + "]"+'  '+`${str}`);
      }else {
        return console.log(`  [ `+Date().substr(15,9)+` ] `+"[" + chalk.bold.rgb(red, green, blue)(bracketedStr) + "] "+`${str}`);
      }
    }else {
      return console.log(`  [ `+Date().substr(15,9)+` ] ${str}`);
    }
  }


  return "";
};

const displayAddressFN = (clickedDetailsAddressFN) => {
  let firstAddress;
  Object.keys(clickedDetailsAddressFN).map(key => {
    if (key !== '_id' && key !== 'address' && clickedDetailsAddressFN[key] && !clickedDetailsAddressFN[key].startsWith('0x') ) {
      firstAddress = clickedDetailsAddressFN[key];
      return;
    } else if (key === 'address') {
      firstAddress = getEllipsisTxt(clickedDetailsAddressFN[key], 6);
      return;
    }
  });
  return firstAddress;
}

exports.displayAddressFN = displayAddressFN;
exports.fancylog = fancylog;
exports.getEllipsisTxt = getEllipsisTxt;




