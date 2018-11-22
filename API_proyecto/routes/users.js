var express = require('express');
var router = express.Router();

const Sync = require('sync')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const jwtsimple  = require('jwt-simple')
const CryptoJS = require('crypto-js').CryptoJS
const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'ChatDB'

/* GET token entrada */
router.get('/login', function(req, res, next) {
  mongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
    if (err) res.status(500).send({status: 500, error: 'al conectar'});
    const database = client.db(dbName)
    const collection = database.collection('usuarios')
    var encpassword = md5(req.query.password)
    collection.find({usuario: req.query.usuario, password: encpassword}).toArray((err, docs)=>{
      if (err) res.status(500).send({status: 500});
      if (docs.length == 0){
        res.status(401).send({status: 401});
      }else{
        var token = generarToken({
          usuario: req.query.usuario,
          password: req.query.password
        }, req.query.secreto)
        res.status(200).send({status: 200, token: token});
      }
    })
  })
});

/* POST new user */
router.post('/register', (req, res, next) => {
  mongoClient.connect(url, {useNewUrlParser : true}, (err, client)=>{
    if (err) res.status(500).send({
        status: 500
    })
    var passcon = md5(req.body.password)
    var json1 = {
      usuario: req.body.usuario,
      password: passcon,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      correo: req.body.correo
    }
    req.body = {no : "content"}
    const database = client.db(dbName)
    const collection = database.collection('usuarios')
    collection.insertOne(json1, err => {
        if (err) {
          res.status(500).send({
            status: 500
        }).end()}
        else{
          res.status(201).send({status: 201}).end()
        }
    })
})
});

/* PUT update user*/
router.put('/actualizar', (req, res, next) =>{
  jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
    if (err){
      res.status(500).send({status : 500});
    }else{
      passcon = md5(req.body.password)
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=> {
        if (err) res.status(500).send({
          status: 500
        })
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({usuario : req.body.usuario, password : passcon}).toArray((err,docs) => {
            if(err) res.status(500).send({status : 500});
            if(docs == ""){
              res.status(404).send({status: 404});
            }else{
              collection.findOneAndUpdate({usuario: req.body.usuario}, {$set : req.body.campo},function(err, client) {
                if (err) throw err;
                console.log(client)
                var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                data = {no : "content"}
                res.status(200).send({status: 200, token: token})
            })
            }
        })    
      })
    }
  })
})

/* PUT update password*/
router.put('/actualizarPassword', (req, res, next) =>{
  jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
    if (err){
      res.status(500).send({status : 500});
    }else{
      passcon = md5(req.body.password)
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=> {
        if (err) res.status(500).send({
          status: 500
        })
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({usuario : req.body.usuario, password : passcon}).toArray((err,docs) => {
            if(err) res.status(500).send({status : 500});
            if(docs == ""){
              res.status(404).send({status: 404});
            }else{
              req.body.campo.password = md5(req.body.campo.password)
              collection.findOneAndUpdate({usuario: req.body.usuario}, {$set : req.body.campo},function(err, client) {
                if (err) throw err;
                console.log(client)
                var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                data = {no : "content"}
                res.status(200).send({status: 200, token: token})
            })
            }
        })    
      })
    }
  })
})

/* DELETE user */
router.delete('/borrar/', (req, res) => {
  var secreto = req.body.jwt
  jwt.verify(req.body.token, secreto, (err, data)=> {
    if (err){
      res.status(403).send({status: 403});
    }else{
      data = ""
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client) =>{
        if(err) res.status(500).send({status: 500});
        var passcon = md5(req.body.password)
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({"usuario" : req.body.usuario, "password" : passcon}).toArray((err,docs) => {
            if(err) return next(createError(500))
            if(docs == ""){
                res.status(404).end();
            }else{
                collection.deleteOne({"usuario" : req.body.usuario, "password" : passcon}, function(err, client) {
                    if (err) throw err;
                    res.status(200).send(
                      {status : 200})
                })
            }
        })
        
    })
    }
  })
  
});

function generarToken(json, clave){
  jwtsimple.encode(json, clave)
  return token = jwt.sign(json, clave, {
      expiresIn: 120
  })
}

module.exports = router;
