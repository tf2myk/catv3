import React, { useEffect, useState } from 'react';
import { createClient} from '@supabase/supabase-js'

// @ts-ignore
import config2 from './config2.js'; 

const supabase = createClient(config2.DATABASE_URL, config2.API_KEY)


// Define an interface to match the API data structure
interface ApiData {
  URL: string;
  Label: string;
  created_at: string;
}

function Gallery() {
  const [galleryData, setGalleryData] = useState<ApiData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setGalleryData(data);

        // Rest of your real-time subscription code
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    const channelA = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'catatable'
        },
        (payload) => 
        {
          console.log("the payload was")
          console.log(payload)
          fetchData()
        }
      )
      .subscribe()

    fetchData();
  }, []);




  function handleImageClick(item:ApiData) {
    const filenameToDelete = item.Label; // Replace with the filename you want to delete
    const apiUrl = `/api/deletefile/${filenameToDelete}`;
    fetch(apiUrl, {method: 'DELETE'})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // If the response status is 204 (No Content), it indicates successful deletion.
        if (response.status === 204) {
          console.log(`File "${filenameToDelete}" has been deleted successfully.`);
        } else {
          console.log(`Possible error reponsded with ${response}`);
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });


  }

  return (
    <div className="gallery">
      {galleryData.map((item, index) => (
        <div key={index} className="gallery-item">
          <img
            className="gallery-image"
            id={item.Label}
            src={item.URL}
            alt={item.Label}
            onClick={() => handleImageClick(item)}
          />
        </div>
      ))}
    </div>
  );
  
}

export default Gallery;