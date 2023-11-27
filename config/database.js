const Sequalize = require('sequelize');

const db = new Sequalize('tourism','root','capstone',{
host: '34.101.52.82',
dialect: 'mysql',
});

db.authenticate().then(()=>{
    console.log("Connection Successful");
}).catch((error)=>{
    console.log("Error connnecting to database");
});

module.exports = db;