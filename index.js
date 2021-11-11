const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

//Database configuration
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ig1ef.mongodb.net/travelDB?retryWrites=true&w=majority`;
const uri = 'mongodb+srv://myb-watches:BvIrMEvOfbTJT4Fj@cluster0.ig1ef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const run = async () => {
    try {
        await client.connect();
        const database = client.db("watchesDB");
        console.log('DB is connected');
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello MYB');
});


app.listen(port, () => {
    console.log('Server is running on port', port);
})