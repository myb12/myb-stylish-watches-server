const express = require('express');
const app = express();
const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//======Database configuration======//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ig1ef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const verifyToken = async (req, res, next) => {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}


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
        const reviewCollection = database.collection("reviews");
        const usersCollection = database.collection('users');
        console.log('DB is connected');

        //======POST API for Add Product======//
        app.post('/product', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productCollection.insertOne(product);

            res.json(result);
        })

        //======GET API for products======// 
        app.get('/products', async (req, res) => {
            getAllItem(req, res, productCollection);
        })

        //=====GET API for specific product======//
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const product = await productCollection.findOne(query);
            res.send(product);
        })

        //======GET API for orders======//
        app.get('/orders', async (req, res) => {
            getAllItem(req, res, orderCollection);
        })

        //======POST API for orders======//
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
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

        //======PUT API to update order status======//
        // app.put('/orders/:id', async (req, res) => {
        //     const id = req.params.id;

        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };

        //     const updateDoc = {
        //         $set: {
        //             orderStatus: "Approved",
        //         },
        //     };

        //     const result = await orderCollection.updateOne(filter, updateDoc, options);

        //     res.json(result);
        // })

        //======POST API for reviews======//
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);

            res.json(result);
        })

        //======GET API for reviews======// 
        app.get('/reviews', async (req, res) => {
            getAllItem(req, res, reviewCollection);
        })

        //======GET API for adding user======// 
        app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') isAdmin = true;

            res.json({ admin: isAdmin })
        })

        //======POST API for adding user======// 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })

        //======PUT API for adding or updating user======// 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //======PUT API for making admin======//
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = {
                        $set: {
                            role: 'admin'
                        }
                    }
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }

            } else {
                res.status(403).json({ message: 'You can not make admin' })
            }
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