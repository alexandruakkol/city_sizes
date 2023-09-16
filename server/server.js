const express = require('express');
const {Client} = require('pg');
const cors = require('cors');
const dbconfig = require('./keys.json');

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