var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
  tradeId: Number, //{ type: Number, required: true },
  buyId: Number,
  buyDate: Date,
  buyUnit: String,
  buyAmount: Number,
  buyPrice: Number,
  buyFiatPrice: Number,
  sellId: Number,
  sellDate: Date,
  sellAmount: Number,
  sellPrice: Number,
  sellFiatPrice: Number,
  sellUnit: String,
  feeId: Number,
  feeDate: Date,
  feeUnit: String,
  feeAmount: Number,
  feePrice: Number,
  feeFiatPrice: Number,
  date: Date
});

module.exports = mongoose.model('orders', orderSchema, 'orders');
