//====================
// Puerto
//====================

process.env.PORT = process.env.PORT || 3000;

//====================
// Entorno
//====================


process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//====================
// Base de datos
//====================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe_user:user1234@ds159273.mlab.com:59273/cafe';
}

process.env.URLDB = urlDB;