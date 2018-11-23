var express = require('express');
var router = express.Router();
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const jwtsimple  = require('jwt-simple')
const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'ChatDB'


/**GET todos los usuarios */
router.get('/allusers', (req, res) => {
  mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
    if (err){
      res.status(500).send({status: 500, message: "error al conectar a la base de datos"});
    }else{
      const database = client.db(dbName)
      const collection = database.collection('usuarios')
      collection.find({}).toArray((err, docs) =>{
        if (err){
          res.status(500).send({
            status: 500, 
            message: "error en el proceso de busqueda"
          })
        }else{
          if (docs.length == 0){
            res.status(404).send({status: 404, message: "No hay usuarios registrados"});
          }else{
            var token = generarToken({
              usuario: data.usuario,
              password: data.password
            }, req.query.secreto)
            res.status(200).send({status: 200, token: token, message: "Lista de usuarios"});
          }
        }
      })
    }
  })
});

/**GET usuarios para conversasiones */
router.get('/conversasiones', (req, res) => {
  jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
    if (err){
      res.status(401).send({status : 401, message: "token no valido"});
    }else{
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
        if (err){
          res.status(500).send({status: 500, message: "error al conectar a la base de datos"});
        }else{
          const database = client.db(dbName)
          const collection = database.collection('usuarios')
          collection.find({}).toArray((err, docs) =>{
            if (err){
              res.status(500).send({
                status: 500, 
                message: "error en el proceso de busqueda"
              })
            }else{
              if (docs.length == 0){
                res.status(404).send({status: 404, message: "No hay usuarios registrados"});
              }else{
                var token = generarToken({
                  usuario: data.usuario,
                  password: data.password
                }, req.query.secreto)
                res.status(200).send({status: 200, token: token, message: "Lista de usuarios"});
              }
            }
          })
        }
      })
    }
  })
});

/* GET login  */
router.get('/login', function(req, res, next) {
  mongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
    if (err) 
    {
      res.status(500).send({status: 500, error: 'error al conectar'});
    }
    const database = client.db(dbName)
    const collection = database.collection('usuarios')
    var encpassword = md5(req.query.password)
    collection.find({usuario: req.query.usuario, password: encpassword}).toArray((err, docs)=>{
      if (err) res.status(500).send({status: 500, message: "error al conectarse con la base de datos"});
      if (docs.length == 0){
        res.status(404).send({status: 404, message: "La contraseña o el usuario no son correctos"});
      }else{
        var token = generarToken({
          usuario: req.query.usuario,
          password: req.query.password
        }, req.query.secreto)
        res.status(200).send({status: 200, token: token, message: "Se logró iniciar sesion"});
      }
    })
  })
});

/* POST new user */
router.post('/register', (req, res, next) => {
  mongoClient.connect(url, {useNewUrlParser : true}, (err, client)=>{
    if (err) res.status(500).send({
        status: 500,
        message: "error al conectarse con la base de datos"
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
            status: 500, 
            message: "error al insertar en la base de datos"
        }).end()}
        else{
          res.status(201).send({status: 201, message: "registro exitoso"}).end()
        }
    })
})
});

/* PUT update user*/
router.put('/actualizar', (req, res, next) =>{
  jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
    if (err){
      res.status(401).send({status : 401, message: "token no valido"});
    }else{
      passcon = md5(req.body.password)
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=> {
        if (err) res.status(500).send({
          status: 500, 
          message: "error al conetarse con la base de datos"
        })
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({usuario : req.body.usuario, password : passcon}).toArray((err,docs) => {
            if(err) res.status(500).send({status : 500, message: "error en el proceso de busqueda"});
            if(docs == ""){
              res.status(404).send({status: 404, message: "Usuario o contraseña no validos"});
            }else{
              collection.findOneAndUpdate({usuario: req.body.usuario}, {$set : req.body.campo},function(err, client) {
                if (err) throw err;
                console.log(client)
                var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                data = {no : "content"}
                res.status(200).send({status: 200, message: "campo actualizado exitosamente", token: token})
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
      res.status(401).send({status : 401, message: "token no valido"});
    }else{
      passcon = md5(req.body.password)
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=> {
        if (err) res.status(500).send({
          status: 500,
          message: "error al conectarse con la base de datos"
        })
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({usuario : req.body.usuario, password : passcon}).toArray((err,docs) => {
            if(err) res.status(500).send({status : 500, message: "error en el proceso de busqueda"});
            if(docs == ""){
              res.status(404).send({status: 404, message: "Usuario o contraseña no validos"});
            }else{
              req.body.campo.password = md5(req.body.campo.password)
              collection.findOneAndUpdate({usuario: req.body.usuario}, {$set : req.body.campo},function(err, client) {
                if (err) throw err;
                console.log(client)
                var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                data = {no : "content"}
                res.status(200).send({status: 200, message: "contraseña actualizado con exito", token: token})
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
      res.status(401).send({status: 401, message: "token no valido"});
    }else{
      data = ""
      mongoClient.connect(url, {useNewUrlParser: true}, (err, client) =>{
        if(err) res.status(500).send({status: 500, message: "error al conectarse con la base de datos"});
        var passcon = md5(req.body.password)
        const database = client.db(dbName)
        const collection = database.collection('usuarios')
        collection.find({"usuario" : req.body.usuario, "password" : passcon}).toArray((err,docs) => {
            if(err) {
              res.status(500).send({status: 500, message: "Error en el proceso de busqueda"});
            }
            if(docs == ""){
                res.status(404).end();
            }else{
                collection.deleteOne({"usuario" : req.body.usuario, "password" : passcon}, function(err, client) {
                    if (err) throw err;
                    res.status(200).send(
                      {status : 200, message: "usuario borrado exitosamente"})
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
