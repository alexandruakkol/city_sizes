const express = require('express');
const {Client} = require('pg');
const cors = require('cors');
require('dotenv').config();

const {DB_HOST, DB_PORT, DB_DATABASE, DB_PASSWORD, DB_USER} = process.env;
const dbconfig = {
    host:DB_HOST,
    port:DB_PORT,
    database:DB_DATABASE,
    password:DB_PASSWORD,
    user:DB_USER
};

const client = new Client(dbconfig);
client.connect();

const PORT = 8001;
const app = express();
const apiRouter = express.Router();

const queries = {
    query_city: 'select * from query_city($1)'
};

function sendBadRequest(res){
    res.statusCode = 400;
    res.send();
}

app.use(cors());
app.use('/api', apiRouter);

apiRouter.get('/cities', async (req, res) => {

    const queryString = req.query.q;
    if(!queryString) return sendBadRequest(res);

    const queryRes = await client.query( queries.query_city, [queryString] );

    res.json(queryRes.rows);
});

async function start(){
    app.listen(PORT, () => {console.log('Listening on port', PORT)});
}

start();