const express = require('express');
const Productos = require('../models/productos');
const _ = require('underscore');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Productos.find({ 'disponible': true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            Productos.count({ 'disponible': true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    conteo
                });
            });

        });
});


app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Productos({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});


app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible']);

    Productos.findOneAndUpdate({ _id: id }, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        };

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let cambiaEstado = {
        disponible: false
    };

    Productos.findOneAndUpdate({ _id: id }, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Producto Borrado'
        });
    });
});

module.exports = app;