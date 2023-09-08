import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';

// Initialize the Google Cloud Storage client
const storage = new Storage({
  keyFilename: './servicekeys.json',
  projectId: 'catfinder-395522',
});

// Function to handle file uploads
export const UploadBucket = (req: Request, res: Response) => {
  console.log(req.body);
  
  const { file } = req.body;
  
  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const bucketName = 'cata-test1'; // Replace with your bucket name
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(file.name);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type,
    },
  });

  blobStream.on('error', (error) => {
    console.error(error);
    return res.status(500).json({ error: 'File upload failed' });
  });

  blobStream.on('finish', () => {
    console.log(`File ${file.name} uploaded successfully.`);
    const fileUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
    return res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  });

  blobStream.end(file.data);
};