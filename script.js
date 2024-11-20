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

  // Resize canvas to fit the screen and draw background
  function resizeCanvas() {
    const tabHeight = tab.offsetHeight;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - tabHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

    // Calculate background image rendering dimensions
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

    // Draw background image
    ctx.globalCompositeOperation = 'source-over'; // Restore normal drawing mode
    ctx.drawImage(backgroundImage, offsetX, offsetY, renderWidth, renderHeight); // Draw background

    // Define clipping path for the uploaded image
    ctx.save(); // Save current context
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, renderWidth, renderHeight); // Clipping region matches background
    ctx.clip();

    // Draw uploaded image (confined within clipping bounds)
    if (uploadedImage) {
      const scaledWidth = uploadedImage.width * uploadedImageScale;
      const scaledHeight = uploadedImage.height * uploadedImageScale;
      const imgX = (canvas.width - scaledWidth) / 2 + uploadedImagePosition.x;
      const imgY = (canvas.height - scaledHeight) / 2 + uploadedImagePosition.y;

      ctx.globalCompositeOperation = 'destination-over'; // Draw the uploaded image behind
      ctx.drawImage(uploadedImage, imgX, imgY, scaledWidth, scaledHeight);
    }

    ctx.restore(); // Restore context to remove clipping path
  }

  backgroundImage.onload = resizeCanvas;
  window.addEventListener('resize', resizeCanvas);

  // Handle file upload
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
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

          // Update tab content
          tabTitle.textContent = "Adjust your photo!";
          tabDescription.textContent = "Use the slider below to position your photo correctly.";
          uploadBtn.textContent = "Next";
          uploadBtn.classList.replace("upload-btn", "next-btn");
          scaleSlider.style.display = "block";
        };
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle scale slider
  scaleSlider.addEventListener('input', (event) => {
    const scaleValue = parseInt(event.target.value, 10);
    uploadedImageScale = 1 + scaleValue / 100; // Map -50 to +50 to a scale factor
    resizeCanvas();
  });

  // Mouse drag functionality for moving image
  function startDrag(clientX, clientY) {
    const scaledWidth = uploadedImage.width * uploadedImageScale;
    const scaledHeight = uploadedImage.height * uploadedImageScale;
    const imgX = (canvas.width - scaledWidth) / 2 + uploadedImagePosition.x;
    const imgY = (canvas.height - scaledHeight) / 2 + uploadedImagePosition.y;

    // Check if the mouse or touch is over the uploaded image
    if (clientX >= imgX && clientX <= imgX + scaledWidth && clientY >= imgY && clientY <= imgY + scaledHeight) {
      isDragging = true;
      dragStart.x = clientX - uploadedImagePosition.x;
      dragStart.y = clientY - uploadedImagePosition.y;
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

  // Mouse events
  canvas.addEventListener('mousedown', (event) => {
    startDrag(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', (event) => {
    moveDrag(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);

  // Touch events for mobile devices
  canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY);
  });

  canvas.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    moveDrag(touch.clientX, touch.clientY);
    event.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener('touchend', endDrag);
  canvas.addEventListener('touchcancel', endDrag);
};
