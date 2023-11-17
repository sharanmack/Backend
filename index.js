const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const {User} = require("./Schema");


 
const cors = require("cors")
app.use(cors({
origin:"*",
}));


mongoose.connect('mongodb://0.0.0.0:27017/Sharan', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });



app.use(bodyParser.json());
app.use(express.json())

app.get("/hii", (req, res) => {
    res.json({ userExists: true });
});


app.post("/login", async (req, res) => {
    const { phone, pass } = req.body;
    console.log(req.body)
    try {
      const user = await User.findOne({ phone });
  
      if (user) {
        if (user.pass === pass) {
        
          res.json({ userExists: true });
        } else {  
          res.status(401).json({ userExists: false, message: "Invalid credentials" });
        }
      } else {
        res.status(401).json({ userExists: false, message: "User not found" });
      }
    } catch (error) {
      console.error("Error querying user:", error);
      res.status(500).send("Error querying user");
    }
  });
  


  app.post("/register", (req, res) => {
    const { phone, pass,name } = req.body;

    const register = new User({
      phone: req.body.phone,
      pass: req.body.pass, 
      name: req.body.naming,
    });
  
    register.save()
      .then(() => {
        console.log("User saved");
        res.status(201).json({ message: "User saved" });
      })
      .catch((error) => {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });
  

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
  
  