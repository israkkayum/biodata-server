const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 65000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.60ufn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("bioData");
    const biodatasCollection = database.collection("biodatas");
    const usersCollection = database.collection("users");
    const contactCollection = database.collection("contactRequest");
    const feedbackCollection = database.collection("feedback");

    app.get("/biodatas/biodata/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const biodata = await biodatasCollection.findOne(query);
      res.json(biodata);
    });

    app.get("/biodatas/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const biodata = await biodatasCollection.findOne(query);
      res.json(biodata);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/biodatas", async (req, res) => {
      const cursor = biodatasCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/paymentList", async (req, res) => {
      const cursor = contactCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/feedback", async (req, res) => {
      const cursor = feedbackCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.post("/biodatas", async (req, res) => {
      const biodata = req.body;
      const result = await biodatasCollection.insertOne(biodata);
      res.json(result);
    });

    app.post("/contactRequest", async (req, res) => {
      const contactdata = req.body;
      const result = await contactCollection.insertOne(contactdata);
      res.json(result);
    });

    app.post("/feedback", async (req, res) => {
      const feedbackdata = req.body;
      const result = await feedbackCollection.insertOne(feedbackdata);
      res.json(result);
    });

    app.put("/biodatas/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status,
        },
      };
      const result = await biodatasCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/biodatas/admin/:id", async (req, res) => {
      const id = req.params.id;
      const adminStatus = req.body.adminStatus;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          adminStatus,
        },
      };
      const result = await biodatasCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/biodatas", async (req, res) => {
      const biodata = req.body;
      const filter = { email: biodata.email };
      const options = { upsert: true };
      const updateDoc = { $set: biodata };
      const result = await biodatasCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/users/admin/remove", async (req, res) => {
      const user = req.body;
      const filter = { email: user.id };
      const updateDoc = { $set: { role: "null" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/paymentList/shifted/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status,
        },
      };
      const result = await contactCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete("/biodatas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await biodatasCollection.deleteOne(query);
      res.json(result);
    });

    app.delete("/feedback/remove/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await feedbackCollection.deleteOne(query);
      res.json(result);
    });

    app.delete("/paymentList/remove/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await contactCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ema jon server is running and running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
