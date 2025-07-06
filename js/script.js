// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the "Get Space Images" button and the gallery area
const getImagesButton = document.querySelector('.filters button');
const galleryDiv = document.getElementById('gallery');

// Create modal elements for showing the large image and info
const modal = document.createElement('div');
modal.id = 'imageModal';
// Modal uses flex to center content
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100vw';
modal.style.height = '100vh';
modal.style.backgroundColor = 'rgba(0,0,0,0.85)';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.zIndex = '1000';
modal.style.transition = 'background 0.2s';

// Modal content container
const modalContent = document.createElement('div');
modalContent.style.background = '#fff';
modalContent.style.padding = '24px 20px 16px 20px';
modalContent.style.borderRadius = '10px';
modalContent.style.maxWidth = '90vw';
modalContent.style.maxHeight = '90vh';
modalContent.style.overflowY = 'auto';
modalContent.style.textAlign = 'center';
modalContent.style.position = 'relative';
modalContent.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
modal.appendChild(modalContent);

// Close button for modal (styled to match app)
const closeBtn = document.createElement('button');
closeBtn.textContent = '×';
closeBtn.setAttribute('aria-label', 'Close');
closeBtn.style.position = 'absolute';
closeBtn.style.top = '10px';
closeBtn.style.right = '16px';
closeBtn.style.background = '#d3d3d3';
closeBtn.style.border = 'none';
closeBtn.style.borderRadius = '50%';
closeBtn.style.width = '36px';
closeBtn.style.height = '36px';
closeBtn.style.fontSize = '24px';
closeBtn.style.cursor = 'pointer';
closeBtn.style.color = '#333';
closeBtn.style.transition = 'background 0.2s';
closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#bfbfbf');
closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = '#d3d3d3');
modalContent.appendChild(closeBtn);

// Add modal to the page
document.body.appendChild(modal);

// Close modal when clicking the close button
closeBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});

// Close modal when clicking outside the modal content
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Also close modal with Escape key for accessibility
document.addEventListener('keydown', function(event) {
  if (modal.style.display === 'flex' && event.key === 'Escape') {
    modal.style.display = 'none';
  }
});

// Listen for a click on the "Get Space Images" button
getImagesButton.addEventListener('click', function() {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message while fetching data
  galleryDiv.innerHTML = `<p>Loading space images...</p>`;

  // NASA API URL with the selected date range and API key
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=UGGIdWFVUAtdf36TjO3ZWRDwYiShmhfUOMAvpx53&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA's API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // If only one image is returned, wrap it in an array for consistency
      const images = Array.isArray(data) ? data : [data];

      // Sort images by date (oldest to newest)
      images.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Show all images in the galleryDiv, one for each date in the range
      galleryDiv.innerHTML = images.map(item => {
        // Check if the media is an image or a video
        if (item.media_type === 'image') {
          // Show image
          return `
            <div class="gallery-item">
              <h2>${item.title}</h2>
              <img src="${item.url}" alt="${item.title}" style="max-width:100%;cursor:pointer;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" class="gallery-image">
              <p>${item.explanation}</p>
              <p><strong>Date:</strong> ${item.date}</p>
            </div>
          `;
        } else if (item.media_type === 'video' && item.url.includes('youtube.com')) {
          // Show YouTube video thumbnail with play icon overlay
          // Extract YouTube video ID
          const videoId = item.url.split('embed/')[1]?.split('?')[0];
          const thumbUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : '';
          return `
            <div class="gallery-item">
              <h2>${item.title}</h2>
              <div style="position:relative;cursor:pointer;" class="gallery-video" data-video="${item.url}">
                <img src="${thumbUrl}" alt="YouTube video thumbnail" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:white;text-shadow:0 2px 8px #000;">▶</span>
              </div>
              <p>${item.explanation}</p>
              <p><strong>Date:</strong> ${item.date}</p>
            </div>
          `;
        } else {
          // For other videos, just show a link
          return `
            <div class="gallery-item">
              <h2>${item.title}</h2>
              <a href="${item.url}" target="_blank" rel="noopener" style="display:block;margin:20px 0;">
                View Video
              </a>
              <p>${item.explanation}</p>
              <p><strong>Date:</strong> ${item.date}</p>
            </div>
          `;
        }
      }).join('');

      // Add click event to each image to open modal
      const imgs = galleryDiv.querySelectorAll('.gallery-image');
      imgs.forEach((img, i) => {
        img.addEventListener('click', function() {
          // Remove everything except the close button
          while (modalContent.childNodes.length > 1) {
            modalContent.removeChild(modalContent.lastChild);
          }
          // Add title
          const titleElem = document.createElement('h2');
          titleElem.textContent = images[i].title;
          titleElem.style.marginTop = '24px';
          modalContent.appendChild(titleElem);

          // Add date
          const dateElem = document.createElement('p');
          dateElem.innerHTML = `<strong>Date:</strong> ${images[i].date}`;
          dateElem.style.color = '#666';
          dateElem.style.margin = '8px 0 16px 0';
          modalContent.appendChild(dateElem);

          // Add large image
          const largeImg = document.createElement('img');
          largeImg.src = images[i].url;
          largeImg.alt = images[i].title;
          largeImg.style.maxWidth = '80vw';
          largeImg.style.maxHeight = '60vh';
          largeImg.style.margin = '10px 0 18px 0';
          largeImg.style.borderRadius = '8px';
          largeImg.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
          modalContent.appendChild(largeImg);

          // Add explanation
          const explanationElem = document.createElement('p');
          explanationElem.textContent = images[i].explanation;
          explanationElem.style.margin = '12px 0 0 0';
          explanationElem.style.fontSize = '16px';
          explanationElem.style.color = '#222';
          modalContent.appendChild(explanationElem);

          // Show the modal
          modal.style.display = 'flex';
        });
      });

      // Add click event to each video thumbnail to open modal with YouTube embed
      const videos = galleryDiv.querySelectorAll('.gallery-video');
      videos.forEach((videoDiv, i) => {
        videoDiv.addEventListener('click', function() {
          // Remove everything except the close button
          while (modalContent.childNodes.length > 1) {
            modalContent.removeChild(modalContent.lastChild);
          }
          // Add title
          const titleElem = document.createElement('h2');
          titleElem.textContent = images[i].title;
          titleElem.style.marginTop = '24px';
          modalContent.appendChild(titleElem);

          // Add date
          const dateElem = document.createElement('p');
          dateElem.innerHTML = `<strong>Date:</strong> ${images[i].date}`;
          dateElem.style.color = '#666';
          dateElem.style.margin = '8px 0 16px 0';
          modalContent.appendChild(dateElem);

          // Add YouTube embed
          const iframe = document.createElement('iframe');
          iframe.src = images[i].url;
          iframe.width = "800";
          iframe.height = "450";
          iframe.style.maxWidth = '80vw';
          iframe.style.maxHeight = '60vh';
          iframe.style.border = 'none';
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          modalContent.appendChild(iframe);

          // Add explanation
          const explanationElem = document.createElement('p');
          explanationElem.textContent = images[i].explanation;
          explanationElem.style.margin = '12px 0 0 0';
          explanationElem.style.fontSize = '16px';
          explanationElem.style.color = '#222';
          modalContent.appendChild(explanationElem);

          // Show the modal
          modal.style.display = 'flex';
        });
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong
      galleryDiv.innerHTML = `<p>Sorry, something went wrong. Please try again.</p>`;
      console.error(error);
    });
});

// Array of fun "Did You Know?" space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has the shortest day of all the planets.",
  "Did you know? Space is completely silent—there is no atmosphere to carry sound.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? There are more stars in the universe than grains of sand on Earth.",
  "Did you know? Saturn could float in water because it is mostly made of gas."
];

// Pick a random fact
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Create a section to display the fact above the gallery
const factSection = document.createElement('div');
factSection.style.background = '#e6f0ff';
factSection.style.color = '#0032A0';
factSection.style.padding = '16px 24px';
factSection.style.margin = '24px 24px 0 24px';
factSection.style.borderRadius = '8px';
factSection.style.fontSize = '18px';
factSection.style.fontWeight = 'bold';
factSection.style.textAlign = 'center';
factSection.textContent = randomFact;

// Insert the fact section above the gallery
const container = document.querySelector('.container');
const gallery = document.getElementById('gallery');
container.insertBefore(factSection, gallery);
