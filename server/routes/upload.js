const express = require('express');
const fileUpload = require('express-fileupload');
const Usuarios = require('../models/usuarios');
const Productos = require('../models/productos');
const fs = require('fs');
const path = require('path');

const app = express();



// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }

    //Validar tipo
    let tiposvalidos = ['productos', 'usuarios'];

    if (tiposvalidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposvalidos.join(', ')
            }
        });
    }



    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];


    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;



    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});


function imagenUsuario(id, res, nombreArchivo) {

    Usuarios.findOneAndUpdate({ _id: id }, (err, usuarioDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');


            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Falla en la conexion a la BD'
                }
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}


function imagenProducto(id, res, nombreArchivo) {

    Productos.findOneAndUpdate({ _id: id }, (err, productoDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Falla en la conexion a la BD'
                }
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}



function borrarArchivo(nombreImagen, tipo) {
    pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlink(pathImagen);
    }

}
module.exports = app;