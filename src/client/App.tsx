//import './App.css'
import './style.css'
import Gallery from './Gallery';
import React, { useState, useEffect } from 'react';






const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadedFileCount, setUploadedFileCount] = useState<number>(0); // Initialize the counter

  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
      event.target.value = ''
      //console.log(selectedFiles);
    }
  };

  const resetSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
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
            setUploadedFileCount((uploadedFileCount) => uploadedFileCount + 1);

            console.log(`uploadedFileCount: ${uploadedFileCount}`);
          } else {
            setMessage(`File ${file.name} upload failed`);
          }
        });

        // Wait for all upload promises to complete before resetting selectedFiles
        await Promise.all(uploadPromises);

        // Reset selectedFiles after all files have been uploaded
        resetSelectedFiles();
        
      } catch (error) {
        console.error('Error uploading files:', error);
        setMessage('An error occurred during file upload');
      }
    } else {
      setMessage('No files selected');
    }
  };

  

  // useEffect(() => {
  //   if (selectedFiles.length > 0 && ) {
  //     handleUpload();
  //   }
  // }, [selectedFiles]); // Trigger the effect when selectedFiles changes


  //<input type="file" name="image" accept="image/*" onChange={handleFileChange} multiple />



  
  return (
    <div className='container'>
      <h1 className='heading'>(wip)</h1>
      <div className="custom-file-input">
        <input type="file" accept="image/*" id="fileInput" onChange={handleFileChange} className="input-hidden" multiple />
        <label htmlFor="fileInput" className="file-label">
          Choose File
        </label>
      </div>
      <button className='button' onClick={handleUpload}> Upload </button>
      {message && <p>{message}</p>}
      <br/><br/><br/><br/><br/>
      <Gallery/>
    </div>
  );
  


};

export default App;