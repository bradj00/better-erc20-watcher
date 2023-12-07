

export const getEllipsisTxt = (str, n = 6) => {
  if (str && typeof str === 'string') { 
    return `${str.slice(0, n)}…${str.slice(str.length - n)}`;
  }
  return "";
};

export const commaNumber = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export const formatNumber = (x) => {
  // Convert the number to a float for accurate comparisons
  const num = parseFloat(x);

  // Format for millions (mm)
  if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'mm';
  }

  // Format for thousands (k)
  if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
  }

  // Format with commas for numbers less than 1000
  let parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

// Example usage
console.log(formatNumber(1234567));  // Outputs: "1.2mm"
console.log(formatNumber(12345));    // Outputs: "12.3k"
console.log(formatNumber(123));      // Outputs: "123"


export const displayAddressFN = (clickedDetailsAddressFN) => {
  let firstAddress;
  Object.keys(clickedDetailsAddressFN).map(key => {
    if (key !== '_id' && key !== 'address' && typeof clickedDetailsAddressFN[key] === 'string' && !clickedDetailsAddressFN[key].startsWith('0x') ) {
      firstAddress = clickedDetailsAddressFN[key];
      return;
    } else if (key === 'address') {
      firstAddress = getEllipsisTxt(clickedDetailsAddressFN[key], 6);
      return;
    }
  });
  return firstAddress;
}




