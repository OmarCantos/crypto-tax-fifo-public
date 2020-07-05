const Rechazo = require('../models/RechazoModel');
const Trade = require('../models/TradeModel');
const Order = require('../models/OrderModel');

//============================PROCESS TRADES===================================

async function processTrades(startDate, endDate){
  Order.find({ 'date': { $gte: startDate, $lt: endDate } }).sort({ date: 1 })
  .then(async (doc) => {
    for (kid of doc) {
      console.log('inside testBatch-find-then: ' + kid.date);
      await processTrade(kid);
    }
  })
  .catch((err) => {
    console.log('ERROR-inside testBatch-find-then: ' + err);
  });
}
exports.processTrades = processTrades;

async function processTrade(orderObj) {

  if (orderObj.buyUnit != 'GNT' && orderObj.sellUnit != 'GNT' && orderObj.buyUnit != 'MANA' && orderObj.sellUnit != 'MANA' && orderObj.buyUnit != 'DNT' && orderObj.sellUnit != 'DNT') {
    //Fiat-Crypto Trade
    console.log('Fiat-Crypto');
    if (orderObj.sellUnit == 'EUR') await recordBuy(orderObj);
    if (orderObj.buyUnit == 'EUR') await recordSell(orderObj);


    if (orderObj.sellUnit != 'EUR' && orderObj.buyUnit != 'EUR') {
      await recordSell(orderObj);
      await recordBuy(orderObj);
    }

  } else {
    recordRechazo(orderObj);
  }
}

//============================/PROCESS TRADES===================================

//===============================RECORD TRADES================================

async function recordBuy(orderObj) {
  var trade = {
    tradeId: orderObj.tradeId,
    buyUnit: orderObj.buyUnit,
    buyAmount: Math.abs(orderObj.buyAmount),
    buyAmountOriginal: Math.abs(orderObj.buyAmount),
    buyDate: orderObj.buyDate,
    buyPrice: (orderObj.buyFiatPrice) ? orderObj.buyFiatPrice : Math.abs(orderObj.buyPrice),
    fees: [{
      feeId: orderObj.tradeId,
      feeUnit: orderObj.feeUnit,
      feeAmount: (orderObj.feeAmount) ? Math.abs(orderObj.feeAmount) : 0,
      feePrice: orderObj.feePrice,
      feeDate: orderObj.buyDate
    }]
  };
  var dbData = new Trade(trade);
  await dbData.save()
    .then((res) => {
      console.log('Buy saved')
    });
}

async function recordSell(orderObj, amountLeft) {
  var amount = (amountLeft) ? amountLeft : Math.abs(orderObj.sellAmount);
  var feeAmount = (amountLeft) ? 0 : Math.abs(orderObj.feeAmount);
  var sellPrice = (orderObj.sellFiatPrice) ? orderObj.sellFiatPrice : Math.abs(orderObj.sellPrice);

  return new Promise((resolve, reject) => {
    Trade.findOne({ buyAmount: { '$gt': 0 }, buyUnit: orderObj.sellUnit }).sort({ buyDate: 1 })
      .then(async (doc) => {
        if (doc == undefined) {
          //reject('rejected' + doc);
          var rechazo = await recordRechazo(orderObj, amount);
          console.log(rechazo);
          resolve(rechazo);
        }

        var buyPrice = (doc.buyFiatPrice) ? doc.buyFiatPrice : Math.abs(doc.buyPrice);

        console.log('find inventory doc: ' + doc.tradeId);
        if (doc.buyAmount >= amount) {
          console.log('doc.buyAmount >= amount: ' + doc.buyAmount + '/n amount: ' + amount);
          doc.sellOrder.push({
            sellAmount: amount,
            sellPrice: sellPrice,
            sellDate: orderObj.date,
            sellId: orderObj.tradeId
          });
          doc.fees.push({
            feeId: orderObj.tradeId,
            feeUnit: orderObj.feeUnit,
            feeAmount: feeAmount,
            feePrice: orderObj.feePrice,
            feeDate: orderObj.date
          });
          doc.vPatrimonio.push({
            change: sellPrice * amount - buyPrice * amount,
            buyUnit: orderObj.buyUnit,
            sellUnit: orderObj.sellUnit,
            date: orderObj.date
          });
          doc.buyAmount -= amount;
          await doc.save()
            .then((result) => {
              console.log(result);
              resolve(result);
            })
            .catch((err) => {
              console.log(err);
            })
        }
        else { //run and rerun
          console.log('doc.amount < doc.amount: ' + doc.buyAmount + ' -- amount: ' + amount);
          doc.sellOrder.push({
            sellAmount: doc.buyAmount,
            sellPrice: sellPrice,
            sellDate: orderObj.date,
            sellId: orderObj.tradeId
          });
          doc.fees.push({
            feeUnit: orderObj.feeUnit,
            feeAmount: feeAmount,
            feeDate: orderObj.date
          });
          doc.vPatrimonio.push({
            change: sellPrice * doc.buyAmount - buyPrice * doc.buyAmount,
            buyUnit: orderObj.buyUnit,
            sellUnit: orderObj.sellUnit,
            date: orderObj.date
          });
          amount -= doc.buyAmount; //pendienteVenta
          // fee.fee = 0; //fee completa en la primera vuelta
          doc.buyAmount = 0; //orden de compra completamente vendida
          await doc.save()
            .then(async (result) => {
              console.log('call 2 recordSell');
              await recordSell(orderObj, amount);
              resolve(result);
            })
            .catch((err) => {
              console.log('save error: ' + err);
            });
        }
      })
      .catch((err) => {
        console.log('problemas chingos: ' + err);
      });
  })
}

async function recordRechazo(orderObj, amountLeft) {
  var amount = (amountLeft) ? amountLeft : Math.abs(orderObj.sellAmount);
  var order = {
    tradeId: orderObj.tradeId,
    buyId: orderObj.buyId,
    buyDate: orderObj.buyDate,
    buyUnit: orderObj.buyUnit,
    buyAmount: orderObj.buyAmount,
    buyPrice: orderObj.buyPrice,
    buyFiatPrice: orderObj.buyFiatPrice,
    sellId: orderObj.sellId,
    sellDate: orderObj.sellDate,
    sellUnit: orderObj.sellUnit,
    sellAmount: orderObj.sellAmount,
    sellPrice: orderObj.sellPrice,
    sellFiatPrice: orderObj.sellFiatPrice,
    feeId: orderObj.feeId,
    feeDate: orderObj.feeDate,
    feeUnit: orderObj.feeUnit,
    feeAmount: orderObj.feeAmount,
    feeFiatPrice: orderObj.feeFiatPrice,
    date: orderObj.date,
    amountLeft: amount
  };

  var dbData = new Rechazo(order);
  await dbData.save()
    .then((res) => {
      console.log('Rechazo saved: ' + res)
    });
}

//===============================/RECORD TRADES================================