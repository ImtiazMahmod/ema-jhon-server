const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

///for cross origin
app.use(cors());
///middle wire
app.use(express.json())

const uri = `mongodb+srv://${process.env.MR_USER}:${process.env.MR_PASS}@cluster0.zbwte.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("ema_Shop");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");

        //GET Products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});

            
            ///pagination
            const count = await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let result;

            if (page) {
                result = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                 result = await cursor.toArray();
            }
           
            res.send({
                count, result
            });
        })

        //POST API to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            console.log('cart hitted');
            const keys = req.body;
            console.log(keys);
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray();
            console.log(products);
            res.json(products);
        })

        ///Orders POST API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            
            const result = await ordersCollection.insertOne(order);
            console.log(result, 'order placed');
            res.json(result)
        })
    }
    finally {
        // client.close()
    }
    
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('server connected')
})


app.listen(port, () => {
    console.log('port connected');
})