# CryptoTaxFIFO

----------

Quick app I made that manages your Coinbase and Coinbase Pro (for now) portfolio using a FIFO method.

Status: unmaintained PoC. Works for me :) . Needs interface (learning Angular and React).


1. Download your trades in csv format.
2. In your mongo server (Docker container in my case).
      1. For Coinbase:
      mongoimport --db=newtest --collection=tradescb --type=csv --headerline --file=your-file.csv
      1. For Coinbase Pro:
      mongoimport --db=newtest --collection=tradescsv --type=csv --headerline --file=your-file.csv
3. node app.js

