var Client = require('coinbase').Client;


//===============================GET FIAT PRICE===================================
function getFiatPrice(unit, unit2, date) {
  var client = new Client({
    'apiKey': process.env.API_KEY,
    'apiSecret': process.env.API_SECRET,
    'strictSSL': false
  });

  return new Promise((resolve, reject) => {
    client.getSpotPrice({
      'currencyPair': unit + '-' + unit2, 'date': date
    },
      (err, price) => {
        if (err) {
          console.log('getSpotPrice error: ' + err + '. Pair: ' + unit + '-' + unit2);


        } else {
          console.log('getSpotPrice res: ' + price.data.amount);
          resolve(price.data.amount);
        }
      });
  });
}
exports.getFiatPrice = getFiatPrice;
//===============================/GET FIAT PRICE===================================