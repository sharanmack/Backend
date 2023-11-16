const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
 
// const cors = require("cors")
// app.use(cors({
// origin:"*",
// }));


// mongoose.connect('mongodb://0.0.0.0:27017/Sharan', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error);
//   });



app.use(bodyParser.json());
app.use(express.json())

app.get("/hii", (req, res) => {
    res.json({ userExists: true });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
  
  