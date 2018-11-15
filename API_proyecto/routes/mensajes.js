var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var jwtsimple  = require('jwt-simple')

const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'ChatDB'

/* GET messages */
router.get('/all'/*/:remitente/:receptor'*/, function(req, res, next) {
  mongoClient.connect(url, {useNewUrlParser: true}, (err, client) =>{
      if (err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('mensajes')
      var vacio = false;
      collection.find({"remitente" : req.query.remitente, "receptor" : req.query.receptor}).toArray((err, docs) =>{
          if (err) return next(createError(500))
          else{
            if (docs.length == 0){
                res.status(404).send({
                    status: 404
                });
            }else{
                var json = {
                    mensajes: docs
                };
                res.send({
                    status: 200,
                    resultado: json
                });
            }
          } 
      })
  })
});

/* POST message */
router.post('/', (req, res, next)=>{
    mongoClient.connect(url, {useNewUrlParser : true}, (err, client)=>{
        if (err) res.status(500).send({
            status: 500
        })
        const database = client.db(dbName)
        const collection = database.collection('mensajes')
        collection.insertOne(req.body, err => {
            if (err) res.status(500).send({
                status: 500
            }).end()
            res.status(201).end()
        })
    })
})

module.exports = router;