const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const Stripe = require("stripe");
const stripe = Stripe(process.env.PAYMENT_GATEWAY_KEY); // Add this line at the top of your file

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@tareknexus.i3y2ilu.mongodb.net/?retryWrites=true&w=majority&appName=TarekNexus`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("ThikanaDB");
    const apartmentsCollection = db.collection("apartments");
   const agreementsCollection = db.collection("agreements");

const usersCollection = client.db("ThikanaDB").collection("users");

const announcementsCollection = db.collection("announcements");

const paymentsCollection = db.collection("payments");
 const couponsCollection = db.collection("coupons");




      // apartment api
    app.get("/apartments", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;

        const minRent = parseInt(req.query.minRent) || 0;
        const maxRent = parseInt(req.query.maxRent) || Number.MAX_SAFE_INTEGER;

        const filter = {
          rent: { $gte: minRent, $lte: maxRent },
        };

        const totalCount = await apartmentsCollection.countDocuments(filter);

        // Pagination query
        const apartments = await apartmentsCollection
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        res.json({ apartments, totalCount });
      } catch (error) {
        console.error("Error fetching apartments:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/agreements/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const agreement = await agreementsCollection.findOne({
          userEmail: email,
        });
        if (!agreement) {
          return res.status(404).json({ message: "No agreement found" });
        }
        res.json(agreement);
      } catch (err) {
        console.error("Error fetching agreement:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/agreements", async (req, res) => {
      try {
        const {
          userName,
          userImage,
          userEmail,
          floorNo,
          blockName,
          apartmentNo,
          rent,
        } = req.body;

        const existing = await agreementsCollection.findOne({
          userEmail,
          status: "pending",
        });
        if (existing) {
          return res
            .status(400)
            .json({ message: "You already have a pending agreement." });
        }

        const newAgreement = {
          userName,
          userEmail,
          floorNo,
          blockName,
          apartmentNo,
          rent,
          status: "pending",
          userRoll: "user",
          createdAt: new Date(),
          userImage,
        };

        await agreementsCollection.insertOne(newAgreement);

        res.status(201).json({ message: "Agreement applied successfully." });
      } catch (error) {
        console.error("Error creating agreement:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/agreements", async (req, res) => {
      try {
        // Find all agreements (you can filter by status if needed)
        const agreements = await agreementsCollection.find({}).toArray();

        res.status(200).json(agreements);
      } catch (error) {
        console.error("Error fetching agreements:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

// apartment api

app.put("/agreements/accept/:email", async (req, res) => {
  const email = req.params.email;

  try {
    // Step 1: Update agreement's status and userRoll in agreement collection
    const agreementResult = await agreementsCollection.updateOne(
      { userEmail: email, status: "pending" },
      { $set: { status: "checked", userRoll: "member" } }
    );

    // Step 2: Update userRoll in users collection
    
    const userResult = await usersCollection.updateOne(
      { email },
      { $set: { userRoll: "member" } }
    );

    res.status(200).json({
      message: "Agreement accepted and userRoll updated to member",
      agreementModified: agreementResult.modifiedCount,
      userModified: userResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error during agreement acceptance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





app.put("/agreements/reject/:email", async (req, res) => {
  const email = req.params.email;

  const result = await agreementsCollection.updateOne(
    { userEmail: email, status: "pending" },
    { $set: { status: "checked" } }
  );

  res.json({ modifiedCount: result.modifiedCount });
});



// announcement api 

app.post("/announcements", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const newAnnouncement = {
      title,
      description,
      createdAt: new Date(),
    };

    await announcementsCollection.insertOne(newAnnouncement);

    res.status(201).json({ message: "Announcement created successfully" });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Server error" });
  }
});



app.get("/announcements", async (req, res) => {
  try {
    const announcements = await announcementsCollection
      .find({})
      .sort({ createdAt: -1 }) // সর্বশেষ ঘোষণাগুলো আগে আসবে
      .toArray();

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// announcement api 

// manage member api 
app.put("/agreements/remove-member/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const result = await agreementsCollection.updateOne(
      { userEmail: email, userRoll: "member" },
      { $set: { userRoll: "user" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Member not found or already removed." });
    }

    res.status(200).json({ message: "Member role reverted to user successfully." });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// role api 

app.get("/users/:email/role", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // agreementsCollection থেকে রোল খুঁজে বের করো
    const agreement = await agreementsCollection.findOne({ userEmail: email });

    if (!agreement) {
      return res.status(200).send({ role: "user" }); // যদি না থাকে, তাহলে user ধরা হবে
    }

    res.send({ role: agreement.userRoll || "user" });
  } catch (error) {
    console.error("Error getting user role:", error);
    res.status(500).send({ message: "Failed to get role" });
  }
})

// payment api 
app.post("/create-payment", async (req, res) => {
  const { userEmail, amount, month, apartmentDetails } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Rent for ${apartmentDetails.apartmentNo} (${month})`,
              description: `Block: ${apartmentDetails.blockName}, Floor: ${apartmentDetails.floorNo}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in paisa
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?email=${userEmail}`,
      cancel_url: `http://localhost:5173/payment-cancelled`,
      metadata: {
        email: userEmail,
        month,
        apartment: apartmentDetails.apartmentNo,
      },
    });

    res.send({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send({ error: "Payment failed" });
  }
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount, email } = req.body;

  try {
    // Optional: Look for an existing payment intent for this email and amount
    // You may store and reuse it using your DB if needed

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects smallest unit (paisa)
      currency: "bdt",
      metadata: { email },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).send({ error: "Failed to create payment intent" });
  }
});

// payment history 
app.post("/payments", async (req, res) => {
  try {
    const { userEmail, amount, month, paymentIntentId, apartmentNo, blockName, floorNo } = req.body;

    if (!userEmail || !amount || !month || !paymentIntentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const paymentRecord = {
      userEmail,
      amount,
      month,
      paymentIntentId,
      apartmentNo,
      blockName,
      floorNo,
      createdAt: new Date(),
    };

    const result = await paymentsCollection.insertOne(paymentRecord);

    res.status(201).json({ message: "Payment recorded", id: result.insertedId });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/payments", async (req, res) => {
  try {
    const email = req.query.email;

    let filter = {};
    if (email) {
      filter.userEmail = email;
    }

    const payments = await paymentsCollection.find(filter).sort({ createdAt: -1 }).toArray();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// coupon 

app.get("/coupons", async (req, res) => {
  try {
    const { code } = req.query; // get coupon code from query string
    let filter = {};

    if (code) {
      filter.code = code.trim();
    }

    const coupons = await couponsCollection.find(filter).sort({ createdAt: -1 }).toArray();
    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Server error" });
  }
});


    

    // Add new coupon
    app.post("/coupons", async (req, res) => {
      try {
        const { code, discount, description } = req.body;

        if (!code || !discount) {
          return res.status(400).json({ message: "Coupon code and discount are required" });
        }

        const newCoupon = {
          code: code.trim(),
          discount: Number(discount),
          description: description?.trim() || "",
          createdAt: new Date(),
        };

        const result = await couponsCollection.insertOne(newCoupon);

        res.status(201).json({ message: "Coupon added", couponId: result.insertedId });
      } catch (error) {
        console.error("Error adding coupon:", error);
        res.status(500).json({ message: "Server error" });
      }
    });





    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("thikana server is running");
});

app.listen(port, () => {
  console.log(`thikana server is running on port ${port}`);
});
