require('dotenv').config()
const fs = require('fs');
const Orders = require('./controllers/orders');
const Trades = require('./controllers/trades');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/newtest',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected...'))
  .catch((err) => console.log(err));

async function startTest() {

  await mongoose.connection.dropCollection('trades')
    .then((doc) => {
      console.log('db dropped: ' + doc);
    })
    .catch((err) => {
      console.log('first THEN block error: ' + err);
    })

  await mongoose.connection.dropCollection('orders')
    .then((doc) => {
      console.log('db dropped: ' + doc);
    })
    .catch((err) => {
      console.log('first THEN block error: ' + err);
    })

  await mongoose.connection.dropCollection('rechazos')
    .then((doc) => {
      console.log('db dropped: ' + doc);
    })
    .catch((err) => {
      console.log('first THEN block error: ' + err);
    })

  // From CSV Raw Import (CB and PRO) to Order Collection

  await Orders.processCSV();


  //From Order Collection to Trade Collection (sells eat from first buys first)
  await Trades.processTrades('2019-01-01', '2020-01-01');



  // //SUM vPatrimonio
  // await Trade.find({ 'vPatrimonio.date': { $gte: '2019-01-01', $lt: '2020-01-01' }, 'vPatrimonio.change': { $lt: 0 } }, { vPatrimonio: 1 }).sort({ 'vPatrimonio.date': 1 })
  //   .then(async (doc) => {
  //     var total = 0;
  //     // console.log('inside testBatch-find-then: ' + doc);
  //     if (Array.isArray(doc)) {
  //       for (kid of doc) {
  //         for (vPatrimonio of kid.vPatrimonio) {
  //           for (item in vPatrimonio) {
  //             fs.writeFile('./test.csv', vPatrimonio, (err, data) => {
  //               if (err) return console.log(err);
  //               console.log('OK: ' + data);
  //               total += vPatrimonio.change;
  //               console.log(vPatrimonio);
  //             })
  //           }
  //         }
  //       }
  //     } else {
  //       console.log('error');
  //       return;
  //     }
  //     console.log('TOTAL AGRI: ' + total);
  //   })
  //   .catch((err) => {
  //     console.log('ERROR-inside testBatch-find-then: ' + err);
  //   })


  // //Export to CSV
  // await Trade.find({ 'vPatrimonio.date': { $gte: '2019-01-01', $lt: '2020-01-01' } }).sort({ 'vPatrimonio.date': 1 })
  //   .then(async (doc) => {
  //     if (Array.isArray(doc)) {
  //       for (kid of doc) {
  //         for (vPatrimonio of kid.vPatrimonio) {
  //           total += vPatrimonio.change;
  //           console.log(vPatrimonio.change);

  //         }
  //       }
  //     } else {
  //       console.log('error');
  //       return;
  //     }
  //     console.log('TOTAL AGRI: ' + total);
  //   })
  //   .catch((err) => {
  //     console.log('ERROR-inside testBatch-find-then: ' + err);
  //   })

}

startTest();