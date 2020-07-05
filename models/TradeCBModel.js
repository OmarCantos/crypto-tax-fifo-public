var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tradesCBSchema = new Schema({
  Timestamp: Date,
  TransactionType: String,
  Asset: String,
  QuantityTransacted: Number,
  EURSpot: Number,
  EURSubtotal: Number,
  EURTotalwFees: Number,
  EURFees: Number,
  Notes: String
});

module.exports = mongoose.model('tradescb', tradesCBSchema, 'tradescb');
