var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tradesCSVSchema = new Schema({
  portfolio: String,
  type: String,
  time: String,
  amount: Number,
  balance: Number,
  unit: String,
  transferid: String,
  tradeid: Number,
  orderid: String
});

module.exports = mongoose.model('tradescsv', tradesCSVSchema, 'tradescsv');
