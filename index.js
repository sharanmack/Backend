const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const {User} = require("./Schema");

var nodemailer = require('nodemailer');
 
const cors = require("cors")
app.use(cors({
origin:"*",
}));

app.use('/uploads', express.static('uploads'));

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
  
app.post('/sendemail', (req, res) => {

  const {name,phone,email,message } = req.body;



var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sharan.gisterpages@gmail.com',
    pass: 'vmewcuxtoyexrjsj'
  }
});

var mailOptions = {
  from: 'sharan.gisterpages@gmail.com',
  to: 'sharanmack06@gmail.com',
  subject: 'Contact Form',
  text: `Name: ${name}\nEmail: ${email}\nphone : ${phone}\nMessage : ${message}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    res.json({emailsent: false });
  } else {
    res.json({ emailsent: true });
  }
});
});



const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
});


const File = mongoose.model('File', fileSchema);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Uploads will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const file = new File({ filename: originalname, path: path });
    await file.save();
    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file' });
  }
});

app.get('/files', async (req, res) => {
  
  try {
    const files = await File.find();
    console.log(files)
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving files' });
  }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
  
