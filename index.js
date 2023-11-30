const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const {User} = require("./Schema");

// const fs = require('fs');
const path = require('path');
const fs = require('fs/promises');

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

  const imagePath = path.join(__dirname, 'uploads', imageName); 

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


// app.post("/deletecar",async(req,res)=>{
//   const {email,brand,images} =req.body
//   console.log(images)

//   try {
//    const post = await Post.findOne({ 'posts.name': name });

//    if (!post) {
//      return res.status(404).json({ postNotFound: true });
//    }

//    const targetPost = post.posts.find((p) => p.name === name);

//    if (!targetPost) {
//      return res.status(404).json({ postNotFound: true });
//    }

//    // Replace the entire comments array with the new one
//    targetPost.comments = comments;
//    await post.save();

//    // Send a success response
//    res.status(200).json({ success: true, message: 'Comments updated successfully' });
//  } catch (error) {
//    console.error(error);
//    res.status(500).json({ error: 'An error occurred while updating comments' });
//  }
// })



const uploadDirectory = path.join(__dirname, 'uploads');

// app.delete('/deletecar', async (req, res) => {
//   const { images } = req.body;
  

//   try {
//     const updatedImages = [];

//     // Loop through the images array and delete each file
//     for (const image of images) {
//       const { filename } = image;
//       console.log(filename)
//       // const filePath = path.join(uploadDirectory, filename);
//       const imagePath = path.join(__dirname, 'uploads', filename); 

//       try {
//         // Check if the file exists
//         await fs.access(imagePath);

//         // Delete the file
//         await fs.unlink(imagePath);

//         // Add the deleted file to the updated images array
//         // updatedImages.push(image);
//       } catch (error) {
//         console.error(`Error deleting file ${filename}: ${error.message}`);
//       }
//     }

//     // Send the updated images array in the response
//     res.json({ images: updatedImages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// app.delete('/deletecar', async (req, res) => {
//   const { images } = req.body;

  
//   try {
//     const updatedImages = [];

//     // Loop through the images array and delete each file
//     for (const image of images) {
//       const { filename } = image;
//       console.log(filename);
//       const imagePath = path.join(__dirname, 'uploads', filename);

//       try {
//         // Check if the file exists
//         await fs.access(imagePath);

//         // Delete the file
//         await fs.unlink(imagePath);

//         // Add the deleted file to the updated images array
//         updatedImages.push(image);
//       } catch (error) {
//         console.error(`Error deleting file ${filename}: ${error.message}`);
//       }
//     }

//     res.json({ result: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


app.delete('/deletecar', async (req, res) => {
  const { email, brand, carName, images } = req.body;

  try {
    const updatedImages = [];

    // Loop through the images array and delete each file
    for (const image of images) {
      const { filename } = image;
      const imagePath = path.join(__dirname, 'uploads', filename);

      try {
        // Check if the file exists
        await fs.access(imagePath);

        // Delete the file
        await fs.unlink(imagePath);

        // Add the deleted file to the updated images array
        updatedImages.push(image);
      } catch (error) {
        console.error(`Error deleting file ${filename}: ${error.message}`);
      }
    }

    // After deleting images, delete the entire collection
    try {
      // Perform the logic to delete the collection based on email, brand, and carName
      // For example, assuming you have a MongoDB collection, you might use something like:
      await File.findOneAndDelete({ email, brand, carName });

      // Replace the above line with the actual logic for deleting the collection in your database

      res.json({ result: true, updatedImages });
    } catch (error) {
      console.error(`Error deleting collection: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
