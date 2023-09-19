const config = require('./config.js');  
import { createClient} from '@supabase/supabase-js'

import { Request, Response } from 'express';

const path = require('path');

const supabase = createClient(config.DATABASE_URL, config.API_KEY)

const serpaAPIkeys = config.SERP_KEY;
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch(serpaAPIkeys);


import express from "express";
import ViteExpress from "vite-express";

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { Storage } = require('@google-cloud/storage');
const storageClient = new Storage({
  keyFilename: 'src/server/gcloudkey.json', // Path to your service account key JSON file
  projectId: 'catfinder-395522', // Your Google Cloud Project ID
});



const bucketName = 'cata_test_1';

const app = express();

app.use(express.static('server'));
app.use(express.json());



// Serve static files from the "src/client" directory



async function insertImageUrl(thename:string, URL:string) {
  try {
    const { data, error } = await supabase.from('catatable').insert([
      { Label: thename, URL: URL, vanity: "DEFAULT"},
    ]);

    if (error) {
      console.error('Error inserting data:', error.message);
    } else {
      console.log('Insert Success:', data);
    }
  } catch (e) {
    console.error('An error occurred:', e);
  }
}





app.get('/results.html', (req, res) => {
  // Construct the absolute path to the results.html file
  const filePath = path.join(__dirname, './results.html');

  // Send the file as a response
  res.sendFile(filePath);
  console.log("results");
});



// Your existing searchcats function
// Your existing searchcats function
const searchcats = async (url: string) => {
  return new Promise((resolve, reject) => {
    const params = {
      engine: "google_lens",
      url: url,
    };

    const callback = function (data: any) {
      resolve(data);
    };

    // Assuming 'search' is your external search library
    search.json(params, callback);
    console.log("searchcats ran");
  });
};

app.post('/api/searchcats', async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    const url = req.body.url; // Assuming 'url' is the key in your JSON payload
    const data = await searchcats(url);
    res.json(data);
  } catch (error) {
    console.error("Error in searchcats:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.get('/api/fetchData', async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('catatable')
    .select('*') // Replace with your desired columns
    .order('created_at'); // Order by the 'created_at' field in ascending order
        
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

    

    

    const filesArray = Array.isArray(req.files) ? req.files : [req.files]; // Convert to an array if not already

    const uploadPromises = filesArray.map((file) => {
      
      let r = (Math.random() + 1).toString(36).substring(7);
      const fileExtension = path.extname(file.originalname);
      const newFileName = `${r}${fileExtension}`;
      return new Promise((resolve, reject) => {
        const blob = storageClient.bucket(bucketName).file(newFileName);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (err:Error) => {
          reject(err);
        });

        blobStream.on('finish', () => {
          const imageUrl = `https://storage.googleapis.com/${bucketName}/${newFileName}`;
          let encodedObjectName = imageUrl.replace(/ /g, '%20');
          //console.log('File uploaded:', encodedObjectName);
          

          insertImageUrl(newFileName, encodedObjectName)
          resolve(encodedObjectName);
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


app.delete('/api/deletefile/:filename', async (req, res) => {
  const { filename } = req.params;

  // try {
  //   await storageClient.bucket(bucketName).file(filename).delete();
  //   res.status(204).send(); // Respond with a 204 No Content status on success
  // } catch (error) {
  //   console.error('Error deleting file:', error);
  //   res.status(500).json({ error: 'Failed to delete file' });
  // }


  // const { data, error } = await supabase
  //   .from('catatable')
  //   .delete()
  //   .eq('Label', filename); // Replace with your table name and primary key column name

  // if (error) {
  //   console.error('Error deleting Supabase record:', error.message);
  // } else {
  //   console.log('Deleted Supabase record:', data);
  // }

  try {
    // Use Promise.all to run both delete operations concurrently
    await Promise.all([
      storageClient.bucket(bucketName).file(filename).delete(),
      supabase.from('catatable').delete().eq('Label', filename),
    ]);
  
    // Both delete operations were successful
    res.status(204).send(); // Respond with a 204 No Content status on success
  } catch (error) {
    console.error('Error deleting:', error);
  
    // Handle errors as needed
    res.status(500).json({ error: 'Failed to delete' });
  }
  






});






ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
