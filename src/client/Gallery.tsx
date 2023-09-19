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
  vanity: string;
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
          //console.log("the payload was")
          console.log(payload)
          fetchData()
        }
      )
      .subscribe()

    fetchData();
  }, []);




  function DeleteItem(item:ApiData) {
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
  


  // return (
  //   <div className="gallery">
  //     {galleryData.map((item, index) => (
  //       <div key={index} className="gallery-item">
  //         <div className="image-container">
  //           <img
  //             className="gallery-image"
  //             id={item.Label}
  //             src={item.URL}
  //             alt={item.Label}
  //             onClick={() => handleImageClick(item)}
  //           />
  //           <div className="image-caption">{item.vanity}</div>
  //         </div>
  //       </div>
  //     ))}
  //   </div>
  // );

  async function RenameItem (item:ApiData)
  {
    const { data, error } = await supabase
    .from('catatable')
    .select('*')
    .eq('Label', item.Label); // Replace 'id' with your primary key field name

    if (data && data.length > 0) {
      const updatedEntry = {
        vanity: 'new_value', // Set the new value
      };
    
      const { data: updatedData, error: updateError } = await supabase
        .from('catatable')
        .update(updatedEntry)
        .eq('Label', item.Label);
    
      if (updateError) {
        // Handle the update error
      } else {
        // Entry has been updated successfully
      }
    }


    
  }

  function handleButton2Click (item:ApiData)
  {
    console.log(item.vanity)
  }

  function handleButton3Click (item:ApiData)
  {
    console.log(item.vanity)
  }


  return (
    <div className="gallery">
      {galleryData.map((item, index) => (
        <div key={index} className="gallery-item">
          <div className="image-container">
            <img
              className="gallery-image"
              id={item.Label}
              src={item.URL}
              alt={item.Label}
              //onClick={() => DeleteItem(item)}
            />
            <div className="image-caption">{item.vanity}</div>
            <div className="image-buttons">
              <button onClick={() => DeleteItem(item)}>Delete</button>
              <button onClick={() => RenameItem(item)}>RenameItem</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
}

export default Gallery;