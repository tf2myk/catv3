import React, { useState } from 'react';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setMessage('File uploaded successfully');
        } else {
          setMessage('File upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage('An error occurred during file upload');
      }
    } else {
      setMessage('No file selected');
    }
  };

  return (
    <div>
      <h2>Google Cloud Storage Uploader</h2>
      <p>Selected File: {selectedFile ? selectedFile.name : 'None'}</p>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;