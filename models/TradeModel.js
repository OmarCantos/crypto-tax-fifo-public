var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tradeSchema = new Schema({
  tradeId: Number, //{ type: Number, required: true },
  buyUnit: String,
  buyAmount: Number,
  buyAmountOriginal: Number,
  buyDate: Date,
  buyPrice: Number,
  buyFiatPrice: Number,
  sellOrder: [{
    sellAmount: Number,
    sellPrice: Number,
    sellFiatPrice: Number,
    sellUnit: String,
    sellDate: Date,
    sellId: Number
  }],
  fees: [{
    feeId: Number,
    feeUnit: String,
    feeAmount: Number,
    feePrice: Number,
    feeFiatPrice: Number,
    feeDate: Date
  }],
  vPatrimonio: [{
    change: Number,
    buyUnit: String,
    sellUnit: String,
    date: Date
  }]//@TODO: always sellPrices - buyPrice | { type: Date, default: Date.now }
});

module.exports = mongoose.model('trades', tradeSchema, 'trades');
