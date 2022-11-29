const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  Timestamp,
} = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cklgizg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const televisionCollection = client
      .db("RohanTelevision")
      .collection("televisions");
    const orderCollection = client.db("RohanTelevision").collection("orders");
    const productCollection = client
      .db("RohanTelevision")
      .collection("products");

    app.get("/televisions", async (req, res) => {
      const size = parseInt(req.query.size);
      const quary = {};
      const cursor = televisionCollection.find(quary);
      const televisions = await cursor
        .limit(size)
        .sort({ timestamp: -1 })
        .toArray();
      res.send(televisions);
    });

    app.get("/televisions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const products = await productCollection.find(query).toArray();
      res.send(products);
    });
    app.post("/order", (req, res) => {
      console.log(req.body);
      orderCollection
        .insertOne({ ...req.body, timestamp: new Timestamp() })
        .then(() => res.send("done"));
    });
    app.get("/order", (req, res) => {
      orderCollection
        .find({})
        .toArray()
        .then((data) => res.send(data));
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));
app.get("/", (req, res) => {
  res.send("Genious car server is running now");
});

app.listen(port, () => {
  console.log(`Genious car server is runnign on ${port}`);
});
