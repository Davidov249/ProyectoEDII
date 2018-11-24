var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var jwtsimple = require('jwt-simple')
var fs = require('fs')
const assert = require('assert')
const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'ChatDB'
const dateFormat = require('dateformat');

/* GET messages */
router.get('/all', function(req, res, next) {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client) =>{
                if (err) {
                    res.status(500).send({message: "error al conectarse con la base de datos"});
                }
                const database = client.db(dbName)
                const collection = database.collection('mensajes')
                var vacio = false;
                var vaciousuario
                collection.find({remitente : req.query.remitente, receptor : req.query.receptor}).toArray((err, docs) =>{
                    if (err) {
                          res.status(500).send({
                          message: "error en el proceso de busqueda"
                        });
                    }
                    else{
                        if (docs.length == 0) {
                            vaciousuario = true;
                        }else{
                            var jsonUsuario = {
                            mensajes: docs
                        };
                        collection.find({remitente: req.query.receptor, receptor: req.query.remitente}).toArray((err, docs2) =>{
                            if (err) {
                                res.status(500).send({
                                    message: "error al conectarse con la base de datos"
                                });
                            }else{
                                if (docs.length == 0) {
                                    vaciousuario2 = true;
                                }
                                if(vaciousuario && vaciousuario2){
                                    res.status(204).send({
                                        message: "no se encontraron mensajes"
                                    });
                                }else{
                                    var jsonUsuario2 = {
                                        mensajes: docs2
                                    }
                                    var token = generarToken({
                                        usuario: data.usuario,
                                        password: data.password
                                        }, req.query.secreto)
                                    data = {no: "content"}
                                    res.status(200).send({
                                        jsonUsuario,
                                        jsonUsuario2,
                                        token: token
                                    });;
                                }
                            }
                        })
                    }
                  } 
              })
          })
        }
    })
});

/* GET last messages */
router.get('/ultimos', function(req, res, next) {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client) =>{
                if (err) {
                    res.status(500).send({message: "error al conectarse con la base de datos"});
                }
                const database = client.db(dbName)
                const collection = database.collection('mensajes')
                var vacio = false;
                var vaciousuario
                collection.find({remitente : req.query.remitente, receptor : req.query.receptor}).toArray((err, docs) =>{
                    if (err) {
                          res.status(500).send({
                          message: "error en el proceso de busqueda"
                        });
                    }
                    else{
                        if (docs.length == 0) {
                            vaciousuario = true;
                        }else{
                            var jsonUsuario = {
                            mensajes: docs[docs.length - 1]
                        };
                        collection.find({remitente: req.query.receptor, receptor: req.query.remitente}).toArray((err, docs2) =>{
                            if (err) {
                                res.status(500).send({
                                    message: "error al conectarse con la base de datos"
                                });
                            }else{
                                if (docs.length == 0) {
                                    vaciousuario2 = true;
                                }
                                if(vaciousuario && vaciousuario2){
                                    res.status(204).send({
                                        message: "no se encontraron mensajes"
                                    });
                                }else{
                                    var jsonUsuario2 = {
                                        mensajes: docs2[docs2.length - 1]
                                    }
                                    var token = generarToken({
                                        usuario: data.usuario,
                                        password: data.password
                                        }, req.query.secreto)
                                    data = {no: "content"}
                                    res.status(200).send({
                                        jsonUsuario,
                                        jsonUsuario2,
                                        token: token
                                    });;
                                }
                            }
                        })
                    }
                  } 
              })
          })
        }
    })
});

/**POST contraseña cifrado mensajes */
router.post('/claves', (req, res) => {
    jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err) res.status(500).send({
                    message: "error al conectarse a la base de datos"
                })
                else{
                    const database = client.db(dbName)
                    const collection = database.collection('claves')
                    var jsoninverso = {
                        remitente: req.body.receptor,
                        receptor: req.body.remitente,
                        clavecifrado: req.body.clavecifrado
                    }
                    collection.insertMany([req.body, jsoninverso], err =>{
                        if (err) 
                        {
                            res.status(500).send({
                            message: "error al insertar"
                            }).end()
                        }else{
                            var token = generarToken({
                                usuario: data.usuario,
                                password: data.password
                                }, req.body.secreto)
                            data = {no: "content"}
                            res.status(201).send({clavecifrado: req.body.clavecifrado, token: token});
                        }
                    })
                }
            })
        }
    })
});

/**GET contraseña de cifrado */
router.get('/claves', (req, res) => {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err) {
                    res.status(500).send({
                    message: "error al conectarse a la base de datos"
                    })
                }else{
                    const database = client.db(dbName)
                    const collection = database.collection('claves')
                    collection.find({remitente: req.query.remitente, receptor: req.query.receptor}).toArray((err, docs)=>{
                        if (err) 
                        {
                            res.status(500).send({
                            message: "error al conectarse con la base de datos"
                            });
                        }else{
                            var token = generarToken({
                                usuario: data.usuario,
                                password: data.password
                                }, req.query.secreto)
                            data = {no: "content"}
                            res.status(200).send(
                                {
                                    clavecifrado: docs[0].clavecifrado,
                                    token: token
                                }
                            );
                        }
                    })
                }
            })
        }
    })
});

/**POST prueba datetime */
router.post('/prueba', (req, res) => {
    var now = new Date();
    dateFormat.masks.formato = 'dd/mm/yyyy-HH:MM:ss';
    console.log(dateFormat(now, "formato"));
     res.json(dateFormat(now, "formato"));
});

/* POST message */
router.post('/', (req, res, next)=>{
    jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser : true}, (err, client)=>{
                if (err) res.status(500).send({
                    message: "error al conectarse con la base de datos"
                })
                const database = client.db(dbName)
                const collection = database.collection('mensajes')
                //formato json = {remitente: x, receptor: y, mensaje: z, , tipo: "mensaje" (la palabra mensaje), fecha: null}
                var now = new Date();
                dateFormat.masks.formato = 'dd/mm/yyyy-HH:MM:ss';
                req.body.fecha = dateFormat(now, "formato")
                collection.insertOne(req.body, err => {
                    if (err) res.status(500).send({
                        message: "error en el proceso de insertar"
                    }).end()
                    var token = generarToken({
                        usuario: data.usuario,
                        password: data.password
                        }, req.query.secreto)
                    data = {no: "content"}
                    res.status(201).send(
                        {
                            token: token
                        })
                })
            })
        }
    })
})

/** GET download message */
router.get('/downloadmsg', (req, res, next) => {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err) {res.status(500).send({
                    message: "Error al conectar con la base de datos"
                })}
                const database = client.db(dbName)
                const collection = database.collection('mensajes')
                collection.find({remitente: req.query.remitente, receptor: req.query.receptor, tipo: "archivo"}).toArray((err, docs) =>{
                    if (err) {res.status(500).send({
                        message: "error en el proceso de buscar"
                    })}else{
                        if (docs.length == 0){
                            res.status(204).send({ 
                                message: "no hay mensajes de archivos"
                            });
                        }else{
                            var token = generarToken({
                                usuario: data.usuario,
                                password: data.password
                              }, req.query.secreto)
                            data = {no: "content"}
                            res.status(200).send({
                                url: docs[docs.length - 1].url,
                                token: token
                            })
                        }
                    }
                })
            })
        }
    }) 
});

/** GET file via download */
router.get('/download', (req, res) => {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            var file = req.query.ruta
            var token = generarToken({
                usuario: data.usuario,
                password: data.password
              }, req.query.secreto)
            res.download(file).status(200).send({token: token})
        }
    })
});

/* Upload a file via message */
router.post('/upload', (req, res, next) => {
    jwt.verify(req.query.token, req.query.secreto, (err, data)=>{
        if (err) {
            res.status(401).send({message: "token no valido"});
        }else{
            let formidable = require('formidable');
            var form = new formidable.IncomingForm();
            form.uploadDir = './uploads'
            form.keepExtensions = true;
            form.maxFieldsSize = 10 * 1024 * 1024
            form.multiples = false;
            form.parse(req, (err, fields, files)=>{
            if (err) {
                res.json({
                    data: {},
                    message: "No se pudo subir el archivo"
                });
        }
        var varfiles = files
        if (varfiles){
            var filename = varfiles.archivo.path.split('\\')[1];
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err) res.status(500).send({
                    message: "Error al conectar con la base de datos"
                })
                const database = client.db(dbName)
                const collection = database.collection('mensajes')
                var now = new Date();
                dateFormat.masks.formato = 'dd/mm/yyyy-HH:MM:ss';
                var mensaje = {
                    remitente: req.query.remitente,
                    receptor: req.query.receptor,
                    tipo: "archivo",
                    url: "uploads/" + filename,
                    nombre: varfiles.archivo.name,
                    fecha: dateFormat(now, "formato")
                }
                collection.insertOne(mensaje, err => {
                    if (err) res.status(500).send({
                        message: "error al enviar el mensaje"
                    }).end()
                    var token = generarToken({
                        usuario: data.usuario,
                        password: data.password
                      }, req.query.secreto)
                    data = {no: "content"}
                    res.status(202).send({
                        data:  "uploads/" + filename,
                        token: token
                    }).end()
                })
            })
        }else{
            res.status(500).send({
                data: {},
                message: "No se subio ningun archivo"
            });
        }
            })
        }
    })
});

/**PUT borrar un mensaje */
router.put('/borrarmensaje', (req, res) => {
    jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
        if(err){
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err){
                    res.status(500).send({message: "error al conectar con la base de datos"});
                }else{
                    const database = client.db(dbName)
                    const collection = database.collection('mensajes')
                    collection.findOneAndUpdate({remitente: req.body.remitente, receptor: req.body.receptor, mensaje: req.body.mensaje}, {$set : {mensaje: "Este mensaje ha sido eliminado"}}, (err, client)=>{
                        if (err){
                            res.status(500).send({message: "error en el proceso de actualizado"});
                        }else{
                            var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                            data = {no : "content"}
                            res.status(200).send({token: token})
                        }
                    })
                }
            })
        }
    })
});

/**PUT borar un mensaje de archivo */
router.put('/borrarmensajearchivo', (req, res) => {
    jwt.verify(req.body.token, req.body.secreto, (err, data)=>{
        if(err){
            res.status(401).send({message: "token no valido"});
        }else{
            mongoClient.connect(url, {useNewUrlParser: true}, (err, client)=>{
                if (err){
                    res.status(500).send({message: "error al conectar con la base de datos"});
                }else{
                    const database = client.db(dbName)
                    const collection = database.collection('mensajes')
                    collection.findOneAndUpdate({remitente: req.body.remitente, receptor: req.body.receptor, url: req.body.url}, {$set : {url: "Este mensaje ha sido eliminado"}}, (err, client)=>{
                        if (err){
                            res.status(500).send({message: "error en el proceso de actualizado"});
                        }else{
                            var token = generarToken({usuario: data.usuario, password: data.password}, req.body.secreto)
                            data = {no : "content"}
                            res.status(200).send({token: token})
                        }
                    })
                }
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