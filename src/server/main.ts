const config = require('./config.js');  
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(config.DATABASE_URL, config.API_KEY)



import express from "express";
import ViteExpress from "vite-express";

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { Storage } = require('@google-cloud/storage');
const storageClient = new Storage({
  keyFilename: 'src/server/asdadsa.json', // Replace with your key file path
});

const bucketName = 'cata_test_1';

const app = express();

async function insertImageUrl(imageUrl:string, thename:string) {
  try {
    const { data, error } = await supabase.from('catatable').insert([
      { URL: imageUrl, Label: thename},
    ]);

    if (error) {
      console.error('Error inserting data:', error.message);
    } else {
      console.log('URL inserted successfully:', data);
    }
  } catch (e) {
    console.error('An error occurred:', e);
  }
}


//const key = import.meta.env.SUPAURL

app.get("/apitest", (_, res) => {

  res.send(
    config.API_KEY
  );
});

app.get("/PagePost", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.get('/api/fetchData', async (req, res) => {
  try {
    const { data, error } = await supabase.from('catatable').select('*'); // Replace with your table name and desired columns
    
    if (error) {
      return res.status(500).json({ error: 'Error fetching data' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});



app.post('/Upload', upload.array('image'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const storageClient = new Storage({
      keyFilename: 'src/server/gcloudkey.json', // Path to your service account key JSON file
      projectId: 'catfinder-395522', // Your Google Cloud Project ID
    });

    const bucketName = 'cata_test_1'; // Your Google Cloud Storage bucket name

    const filesArray = Array.isArray(req.files) ? req.files : [req.files]; // Convert to an array if not already

    const uploadPromises = filesArray.map((file) => {
      return new Promise((resolve, reject) => {
        const blob = storageClient.bucket(bucketName).file(file.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (err:Error) => {
          reject(err);
        });

        blobStream.on('finish', () => {
          const imageUrl = `https://storage.googleapis.com/${bucketName}/${file.originalname}`;
          let encodedObjectName = imageUrl.replace(/ /g, '%20');
          console.log('File uploaded:', encodedObjectName);
          insertImageUrl(imageUrl, file.originalname.toString())
          resolve(imageUrl);
        });

        blobStream.end(file.buffer);
      });
    });

    Promise.all(uploadPromises)
      .then((imageUrls) => {
        res.status(200).json({ imageUrls });
      })
      .catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred during file upload' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});






ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
