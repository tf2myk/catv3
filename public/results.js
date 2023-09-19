// @ts-nocheck
let matches;
let galleryContainer;
let contentSelector;

document.addEventListener('DOMContentLoaded', () => 
{

    contentSelector = document.querySelector('select#view-selector');
    const galleryContainer = document.getElementById('gallery-container');
    // Listen for change event on the selector

    contentSelector.addEventListener('change', () => {
      grabber(matches);
    });

    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
   
    //Grabbing the item from shared storage for the fetch
    var parameterValue = getParameterByName('parameter');
    if(parameterValue)
    {
        //imgElement = document.querySelector('.layout-container');

        
        //console.log(JSON.stringify({ url: parameterValue }))

        // Logic for Searching
        fetch('/api/searchcats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: parameterValue }),
        })
          .then(response => response.json())
          .then(data => {
            matches = data;
            grabber(matches);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });

        const imgElement = document.querySelector('img#compare');
        //console.log(imgElement);
        imgElement.src = parameterValue;
    }
    else
    {
        console.log("parameterValue is not in parameters");
    }

    
    

});


function grabber(data)
{
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';
    let arraysize = data.visual_matches.length;
    let counter = 0;
    const option = contentSelector.value;

    for(let i = 0; i < arraysize; i++ )
    {

      if (counter > 10)
      {
        break;
      }
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';

      const thumbnailImage = document.createElement('img');
      thumbnailImage.src = data.visual_matches[i].thumbnail;
      thumbnailImage.alt = data.visual_matches[i].title;
      link = document.createElement('a');
      link.target = "_blank";
      link.href = data.visual_matches[i].link;
      link.textContent = 'Visit';

      galleryItem.appendChild(thumbnailImage);
      galleryItem.appendChild(link);


      if(option == "Ecotrade" && data.visual_matches[i].link.includes('ecotrade'))
      {
        galleryContainer.appendChild(galleryItem);   
      }
      else if(option == "None")
      {
        galleryContainer.appendChild(galleryItem);
      }
      counter += 1;
    }

}
