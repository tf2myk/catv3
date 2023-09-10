//import './App.css'
import './style.css'
import Gallery from './Gallery';
import React, { useState, useEffect } from 'react';


const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  const handleUpload = async () => {
    //console.log("handleUpload Called");
    if (selectedFiles.length > 0) {
      try {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('image', file);
  
          const response = await fetch('/Upload', {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setMessage(`File ${file.name} uploaded successfully`);
          } else {
            setMessage(`File ${file.name} upload failed`);
          }
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        setMessage('An error occurred during file upload');
      }
    } else {
      setMessage('No files selected');
    }
  };

  useEffect(() => {
    if (selectedFiles.length > 0) {
      handleUpload();
    }
  }, [selectedFiles]); // Trigger the effect when selectedFiles changes

  
  return (
    <div className='container'>
      <h1 className='heading'>Inventory Management</h1>
      <input type="file" name="image" accept="image/*" onChange={handleFileChange} multiple />
      {message && <p>{message}</p>}
      <br/><br/><br/><br/><br/>
      <Gallery/>
    </div>
  );
  


};

export default App;