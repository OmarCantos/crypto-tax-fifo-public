const TradesCB = require('../models/TradeCBModel');
const TradesCBPro = require('../models/TradeCBProModel');
const Order = require('../models/OrderModel');
const CoinbaseApi = require('./api')

async function processCSV() {
  //@TODO: Run both and resolve() one Promise?
  await TradesCB.find({ TransactionType: { $in: ['Buy'] } }).sort({ Timestamp: 1 })
    .then(async (doc) => {
      for (line of doc) {
        console.log('line.Timestamp: ' + line.Timestamp);
        await processOrders(line);
      }
    })
    .catch((err) => {
      console.log('Find distinct ids err: ' + err)
    })

  console.log('after for');

  //@TODO: Make it in a single run. $group?
  await TradesCBPro.find({ type: { $in: ['match', 'fee'] } }).sort({ time: 1 }).distinct('tradeid')
    .then(async (doc) => {
      for (line of doc) {
        await TradesCBPro.find({ tradeid: line })
          .then(async (doc) => {
            console.log('inside testBatch-find-then: ' + doc.tradeid);
            await processOrdersPro(doc);
          })
          .catch((err) => {
            console.log(err);
          })
      }
    })
    .catch((err) => {
      console.log('Find distinct ids err: ' + err)
    })
  console.log('Finished processing CSV collection');
}
exports.processCSV = processCSV;


//============================PROCESS ORDERS PRO===================================

async function processOrdersPro(dbObj) {
  var tradeId;
  var buyId;
  var buyUnit;
  var buyAmount;
  var buyPrice;
  var buyFiatPrice;
  var buyDate;
  var sellId;
  var sellAmount;
  var sellPrice;
  var sellFiatPrice;
  var sellUnit;
  var sellDate;
  var feeId;
  var feeUnit;
  var feeAmount;
  var feeFiatPrice;
  var feeDate
  var date;

  for (line of dbObj) {
    if (line.type == 'match') {
      if (line.amount < 0) {
        sellId = line.tradeid;
        sellAmount = line.amount;
        sellUnit = line.unit;
        sellDate = line.time;
      }
      if (line.amount > 0) {
        buyId = line.tradeid;
        buyUnit = line.unit;
        buyAmount = line.amount;
        buyDate = line.time;

      }
    } if (line.type == 'fee') {
      feeId = line.tradeid;
      feeUnit = line.unit;
      feeAmount = line.amount;
      feeDate = line.time;
    }
  }

  if (buyId == sellId) tradeid = buyId;
  if (buyDate == sellDate) date = buyDate;
  sellPrice = buyAmount / sellAmount;
  buyPrice = sellAmount / buyAmount;

  //@TODO: Check if new token prices are available and modify accordingly
  if (buyUnit != 'EUR' && sellUnit != 'EUR' && buyUnit != 'GNT' && sellUnit != 'GNT' && buyUnit != 'MANA' && sellUnit != 'MANA' && buyUnit != 'DNT' && sellUnit != 'DNT') {
    buyFiatPrice = await CoinbaseApi.getFiatPrice(buyUnit, 'EUR', date);
    sellFiatPrice = await CoinbaseApi.getFiatPrice(sellUnit, 'EUR', date);
    feeFiatPrice = await CoinbaseApi.getFiatPrice(feeUnit, 'EUR', date);
  }
  var orderObj = {
    tradeId: tradeid,
    buyId: buyId,
    buyDate: buyDate,
    buyUnit: buyUnit,
    buyAmount: Math.abs(buyAmount),
    buyPrice: Math.abs(buyPrice),
    buyFiatPrice: buyFiatPrice,
    sellId: sellId,
    sellDate: sellDate,
    sellUnit: sellUnit,
    sellAmount: Math.abs(sellAmount),
    sellPrice: Math.abs(sellPrice),
    sellFiatPrice: sellFiatPrice,
    feeId: feeId,
    feeDate: feeDate,
    feeUnit: feeUnit,
    feeAmount: (feeAmount) ? Math.abs(feeAmount) : 0,
    feeFiatPrice: feeFiatPrice,
    date: date
  };

  var order = new Order(orderObj);
  await order.save()
    .then((res) => {
      console.log('Order saved: ' + res)
    });
}

//============================/PROCESS ORDERS PRO===================================
//============================PROCESS ORDERS===================================

async function processOrders(dbObj) {
  console.log(dbObj);
  var orderObj = {
    buyId: 999999,
    buyDate: dbObj.Timestamp,
    buyUnit: dbObj.Asset,
    buyAmount: dbObj.QuantityTransacted,
    buyPrice: dbObj.EURSpot,
    // buyFiatPrice: buyFiatPrice,
    sellId: 999999,
    sellDate: dbObj.Timestamp,
    sellUnit: 'EUR',
    sellAmount: dbObj.QuantityTransacted * dbObj.EURSpot,
    sellPrice: dbObj.QuantityTransacted / (dbObj.QuantityTransacted * dbObj.EURSpot),
    // sellFiatPrice: sellFiatPrice,
    feeId: 999999,
    feeDate: dbObj.Timestamp,
    feeUnit: 'EUR',
    feeAmount: dbObj.EURFees,
    // feeFiatPrice: feeFiatPrice,
    date: dbObj.Timestamp
  };

  var order = new Order(orderObj);
  await order.save()
    .then((res) => {
      console.log('Order saved: ' + res)
    });
}
//============================/PROCESS ORDERS===================================