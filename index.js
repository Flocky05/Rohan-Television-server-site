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
    const userCollection = client.db("RohanTelevision").collection("users");
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
        .find({ buyerEmail: req.query.email })
        .toArray()
        .then(async (data) => {
          await Promise.all(
            data.map((el) =>
              productCollection
                .findOne({ _id: ObjectId(el.television_id) })
                .then((el2) => (el.television = el2))
            )
          );
          res.send(data);
        });
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    // user routes start
    app.post("/user", (req, res) => {
      userCollection.insertOne(req.body).then((_) => res.send(_));
    });
    app.get("/user", (req, res) => {
      userCollection
        .findOne({ email: req.query.email })
        .then((_) => res.send(_));
    });
    app.delete("/user/:id", (req, res) => {
      userCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((_) => res.send(_));
    });
    app.get("/users", (req, res) => {
      userCollection
        .find({
          role: { $ne: "admin" },
        })
        .toArray()
        .then((_) => res.send(_));
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
