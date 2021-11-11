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


//======Custom function for getting all item from Database======//
const getAllItem = async (req, res, collection) => {
    const cursor = await collection.find({});
    const items = await cursor.toArray();
    res.send(items);
}



const run = async () => {
    try {
        await client.connect();
        const database = client.db("watchesDB");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        console.log('DB is connected');

        //======POST API for Add Product======//
        app.post('/product', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productCollection.insertOne(product);

            res.json(result);
        })

        //======POST API for orders======//
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);

            res.json(result);
        })

        //=====GET API for specific orders======//
        app.post('/my-orders', async (req, res) => {
            const { email } = req.query;
            const query = { email: email };
            const orders = await orderCollection.find(query).toArray();
            res.json(orders);
        })

        //=====DELETE API for my-orders======//
        app.delete('/my-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await orderCollection.deleteOne(query);

            res.json(result);
        })

        //======GET API for all orders======// 
        app.get('/all-orders', async (req, res) => {
            getAllItem(req, res, orderCollection);
        })

        //======PUT API to update order status======//
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    orderStatus: "Approved",
                },
            };

            const result = await orderCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        })


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