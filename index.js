const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const {User} = require("./Schema");

const fs = require('fs');
const path = require('path');

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

app.delete('/deleteImage', (req, res) => {
  const imageName = req.query.imageName;
  if (!imageName) {
    return res.status(400).send('ImageName parameter is required.');
  }

  const imagePath = path.join(__dirname, 'uploads', imageName); // Adjust the path accordingly

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`File ${imageName} has been deleted successfully.`);
      res.status(200).send('File deleted successfully');
    }
  });
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
  images: [
    {
      filename: String,
      path: String,
    },
  ],
  filenames: [String],
  paths: [String],
  email: String,
  brand: String,
  carName: String,
  carModel: String,
  fuelType: String,
  carkilometre: Number,
  carPrice: Number,
  contactDetails: String,
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
    // console.log(req.body)
    cb(null, Date.now() + file.originalname );
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.array('files', 2), async (req, res) => {
  try {
    const files = req.files;
    const { email, brand, carName, carModel, fuelType, carkilometre, carPrice, contactDetails } = req.body;

    // const filenames = files.map(file => file.originalname);
    // const paths = files.map(file => file.path);

    const images = files.map(file => ({
      filename: file.filename,  // Use the generated filename
      path: file.path,
    }))

    const fileDoc = {
      images: images,
      // paths: paths,
      email: email,
      brand: brand,
      carName: carName,
      carModel: carModel,
      fuelType: fuelType,
      carkilometre: carkilometre,
      carPrice: carPrice,
      contactDetails: contactDetails,
    };

    await File.create(fileDoc);
    res.status(201).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

app.get('/files', async (req, res) => {
  
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving files' });
  }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
  

// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const { originalname, path ,email,brand } = req.file;
//     const file = new File({ filename: originalname, brand: brand , email : email });
//     await file.save();
//     res.status(201).json({ message: 'File uploaded successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error uploading file' });
//   }
// });
