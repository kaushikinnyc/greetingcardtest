window.onload = function () {
  const canvas = document.getElementById('backgroundCanvas');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const scaleSlider = document.getElementById('scaleSlider');

  const tab = document.querySelector('.tab');
  const tabTitle = tab.querySelector('h1');
  const tabDescription = tab.querySelector('p');

  const backgroundImage = new Image();
  backgroundImage.src = 'test1.png'; // Replace with your actual background image path

  let uploadedImage = null;
  let uploadedImageScale = 1;
  let uploadedImagePosition = { x: 0, y: 0 }; // Initial position of the uploaded image
  let isDragging = false;
  let dragStart = { x: 0, y: 0 }; // Coordinates where drag started
  let userText = ""; // Variable to store user input text
  let isUploaded = false; // Flag to track if image has been uploaded

  // Resize canvas to fit the screen and draw background
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - tab.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageAspectRatio = backgroundImage.width / backgroundImage.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let renderWidth, renderHeight, offsetX, offsetY;
    if (imageAspectRatio > canvasAspectRatio) {
      renderWidth = canvas.width;
      renderHeight = renderWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      renderHeight = canvas.height;
      renderWidth = renderHeight * imageAspectRatio;
      offsetX = (canvas.width - renderWidth) / 2;
      offsetY = 0;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(backgroundImage, offsetX, offsetY, renderWidth, renderHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, renderWidth, renderHeight);
    ctx.clip();

    if (uploadedImage) {
      const scaledWidth = uploadedImage.width * uploadedImageScale;
      const scaledHeight = uploadedImage.height * uploadedImageScale;
      const imgX = (canvas.width - scaledWidth) / 2 + uploadedImagePosition.x;
      const imgY = (canvas.height - scaledHeight) / 2 + uploadedImagePosition.y;

      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(uploadedImage, imgX, imgY, scaledWidth, scaledHeight);
    }

    // Draw user text if available
    if (userText) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'white';
      ctx.font = '32px Arial'; // Customize the font size and family
      const textX = (canvas.width - ctx.measureText(userText).width) / 2; // Center the text horizontally
      const textY = canvas.height - 50; // Position the text 50px from the bottom
      ctx.fillText(userText, textX, textY);
    }

    ctx.restore();
  }

  backgroundImage.onload = resizeCanvas;
  window.addEventListener('resize', resizeCanvas);

  uploadBtn.addEventListener('click', () => {
    if (!isUploaded) {  // Check if the image has not been uploaded yet
      fileInput.click();  // Open the file input
    }
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImage = new Image();
        uploadedImage.src = e.target.result;

        uploadedImage.onload = function () {
          resizeCanvas();
          tabTitle.textContent = "Adjust your photo!";
          tabDescription.textContent = "Use the slider below to position your photo correctly.";
          uploadBtn.textContent = "Next";
          uploadBtn.classList.replace("upload-btn", "next-btn");
          scaleSlider.style.display = "block";

          // After uploading, hide the file input and set the flag
          fileInput.style.display = "none";  // Hide file input after upload
          isUploaded = true; // Set flag to true
        };
      };
      reader.readAsDataURL(file);
    }
  });

  scaleSlider.addEventListener('input', (event) => {
    const scaleValue = parseInt(event.target.value, 10);
    uploadedImageScale = 1 + scaleValue / 100;
    resizeCanvas();
  });

  function startDrag(clientX, clientY) {
    if (uploadedImage) { // Check if the image is loaded
      const scaledWidth = uploadedImage.width * uploadedImageScale;
      const scaledHeight = uploadedImage.height * uploadedImageScale;
      const imgX = (canvas.width - scaledWidth) / 2 + uploadedImagePosition.x;
      const imgY = (canvas.height - scaledHeight) / 2 + uploadedImagePosition.y;

      if (clientX >= imgX && clientX <= imgX + scaledWidth && clientY >= imgY && clientY <= imgY + scaledHeight) {
        isDragging = true;
        dragStart.x = clientX - uploadedImagePosition.x;
        dragStart.y = clientY - uploadedImagePosition.y;
      }
    }
  }

  function moveDrag(clientX, clientY) {
    if (isDragging) {
      uploadedImagePosition.x = clientX - dragStart.x;
      uploadedImagePosition.y = clientY - dragStart.y;
      resizeCanvas();
    }
  }

  function endDrag() {
    isDragging = false;
  }

  // Handle mouse events
  canvas.addEventListener('mousedown', (event) => startDrag(event.clientX, event.clientY));
  canvas.addEventListener('mousemove', (event) => moveDrag(event.clientX, event.clientY));
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);

  // Handle touch events
  canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY);
  });

  canvas.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  });

  canvas.addEventListener('touchend', endDrag);

  // Add event listener for the Next button
  uploadBtn.addEventListener('click', () => {
    if (uploadBtn.textContent === "Next") {
      // Clear the contents of the tab and update the text
      tabTitle.textContent = "Add a message";
      tabDescription.textContent = "Enter a short message to be printed on your card below";
      
      // Remove the scale slider and file input
      scaleSlider.style.display = "none";

      // Create and add a text field for user input
      const messageField = document.createElement('input');
      messageField.type = 'text';
      messageField.id = 'messageField';
      messageField.placeholder = "Your message here";
      messageField.style.border = "2px solid #C8102E"; // Red border color to match the theme
      messageField.style.padding = "10px";
      messageField.style.borderRadius = "10px";
      messageField.style.width = "80%";
      messageField.style.marginTop = "20px";
      tab.appendChild(messageField);

      // Change the Next button text to "Finish"
      uploadBtn.textContent = "Finish";
    } else if (uploadBtn.textContent === "Finish") {
      // Capture the text entered by the user
      const messageField = document.getElementById('messageField');
      userText = messageField.value; // Set the user text
      
      // Trigger the canvas update with the text
      resizeCanvas();

      // Convert canvas to image data
      const imageData = canvas.toDataURL('image/png'); // This is the base64 data of the canvas image

      // Prepare the data to upload to Cloudinary
      const formData = new FormData();
      formData.append('file', imageData);
      formData.append('upload_preset', 'greetingcard1');
      formData.append('api_key', '929982236717351'); // Replace with your actual Cloudinary API key

      // Send the image to Cloudinary
      fetch('https://api.cloudinary.com/v1_1/dyn8tf9kn/image/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Image uploaded successfully:', data);
        alert('Your card has been uploaded successfully!');
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      });
    }
  });
};
