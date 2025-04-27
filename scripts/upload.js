// JavaScript for upload.html page handling file upload, form validation, and order summary

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const fileList = document.getElementById('fileList');
  const fileItems = document.getElementById('fileItems');
  const fileCount = document.getElementById('fileCount');
  const uploadBtn = document.getElementById('uploadBtn');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const uploadForm = document.getElementById('uploadForm');

  let files = [];

  // Drag and Drop Events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-active'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-active'), false);
  });

  dropzone.addEventListener('drop', handleDrop, false);
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  addMoreBtn.addEventListener('click', () => fileInput.click());
  clearAllBtn.addEventListener('click', clearAllFiles);
  uploadBtn.addEventListener('click', startUpload);

  // Form inputs for validation
  const studioNameInput = document.getElementById('studioName');
  const customerPhoneInput = document.getElementById('customerPhone');
  const studioNameError = document.getElementById('studioNameError');
  const customerPhoneError = document.getElementById('customerPhoneError');

  // Enable or disable upload button based on validation
  function updateUploadButtonState() {
    const isStudioNameValid = studioNameInput.value.trim().length > 0;
    const phonePattern = /^\+?\d{10,15}$/;
    const isPhoneValid = phonePattern.test(customerPhoneInput.value.trim());
    const hasFiles = files.length > 0;

    studioNameError.style.display = isStudioNameValid ? 'none' : 'block';
    customerPhoneError.style.display = isPhoneValid ? 'none' : 'block';

    uploadBtn.disabled = !(isStudioNameValid && isPhoneValid && hasFiles);
  }

  studioNameInput.addEventListener('input', updateUploadButtonState);
  customerPhoneInput.addEventListener('input', updateUploadButtonState);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const newFiles = dt.files;
    handleFiles(newFiles);
  }

  function handleFileSelect() {
    handleFiles(fileInput.files);
  }

  function handleFiles(newFiles) {
    files = [...files, ...Array.from(newFiles)];
    updateFileList();
    fileList.classList.remove('hidden');
    fileInput.value = '';
    updateUploadButtonState();
  }

  function updateFileList() {
    fileItems.innerHTML = '';
    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item bg-white p-4 rounded-lg shadow-sm flex items-center';
      fileItem.setAttribute('role', 'listitem');
      fileItem.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
          <i class="fas fa-file-image text-blue-500"></i>
        </div>
        <div class="flex-grow">
          <p class="font-medium text-gray-800 truncate" title="${file.name}">${file.name}</p>
          <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
        </div>
        <button class="text-red-400 hover:text-red-600 focus:outline-none" aria-label="Remove file ${file.name}" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
      fileItems.appendChild(fileItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('[data-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.currentTarget.getAttribute('data-index');
        files.splice(index, 1);
        updateFileList();
        if (files.length === 0) {
          fileList.classList.add('hidden');
        }
        updateUploadButtonState();
      });
    });

    fileCount.textContent = files.length;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function clearAllFiles() {
    files = [];
    fileList.classList.add('hidden');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    updateUploadButtonState();
  }

  function startUpload() {
    if (uploadBtn.disabled) return;

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';

    // Prepare form data for actual upload
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('studioName', studioNameInput.value.trim());
    formData.append('phone', customerPhoneInput.value.trim());
    formData.append('glossyQty', document.getElementById('glossyQty').value.trim());
    formData.append('glossyPages', document.getElementById('glossyPages').value.trim());
    formData.append('silkMattQty', document.getElementById('silkMattQty').value.trim());
    formData.append('silkMattPages', document.getElementById('silkMattPages').value.trim());
    formData.append('featherQty', document.getElementById('featherQty').value.trim());
    formData.append('featherPages', document.getElementById('featherPages').value.trim());
    formData.append('specialInstructions', document.getElementById('specialInstructions').value.trim());

    // Send files and data to backend server
    fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        uploadComplete(data);
      })
      .catch(error => {
        alert('Upload failed. Please try again.');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload mr-2"></i> Start Upload';
      });
  }

  function uploadComplete(data) {
    uploadBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Upload Complete';

    // Show success message with order summary from server response
    const customerDetails = {
      studioName: data.customerDetails.studioName,
      phone: data.customerDetails.phone,
      materials: {
        glossy: {
          qty: data.customerDetails.glossyQty,
          pages: data.customerDetails.glossyPages
        },
        silkMatt: {
          qty: data.customerDetails.silkMattQty,
          pages: data.customerDetails.silkMattPages
        },
        feather: {
          qty: data.customerDetails.featherQty,
          pages: data.customerDetails.featherPages
        }
      },
      instructions: data.customerDetails.specialInstructions,
      files: data.files
    };

    const successMsg = document.createElement('div');
    successMsg.className = 'mt-6 p-4 bg-green-100 text-green-800 rounded-lg';
    successMsg.setAttribute('role', 'alert');
    successMsg.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          <p class="font-medium">Order Submitted Successfully!</p>
        </div>
        <div class="text-left text-sm">
          <p><span class="font-medium">Studio:</span> ${customerDetails.studioName}</p>
          <p><span class="font-medium">Phone:</span> ${customerDetails.phone}</p>
          <p><span class="font-medium">Materials:</span> 
            ${customerDetails.materials.glossy.qty > 0 ? customerDetails.materials.glossy.qty + ' Glossy' : ''}
            ${customerDetails.materials.silkMatt.qty > 0 ? customerDetails.materials.silkMatt.qty + ' Silk Matt' : ''}
            ${customerDetails.materials.feather.qty > 0 ? customerDetails.materials.feather.qty + ' Feather' : ''}
          </p>
          <p><span class="font-medium">Files:</span> ${customerDetails.files.length} uploaded</p>
        </div>
        
        <div class="flex flex-col space-y-3 mt-4">
          <p class="text-sm">Share your order details:</p>
          <div class="grid grid-cols-2 gap-3">
            <a href="https://wa.me/919842902191?text=${encodeURIComponent(
              `New Album Order\n` +
              `Studio: ${customerDetails.studioName}\n` +
              `Phone: ${customerDetails.phone}\n` +
              `Materials:\n` +
              `- Glossy: ${customerDetails.materials.glossy.qty} (Pages: ${customerDetails.materials.glossy.pages || 'N/A'})\n` +
              `- Silk Matt: ${customerDetails.materials.silkMatt.qty} (Pages: ${customerDetails.materials.silkMatt.pages || 'N/A'})\n` +
              `- Feather: ${customerDetails.materials.feather.qty} (Pages: ${customerDetails.materials.feather.pages || 'N/A'})\n` +
              `Special Instructions: ${customerDetails.instructions || 'None'}\n` +
              `Files: ${customerDetails.files.length} photos`
            )}" 
            target="_blank"
            class="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition" rel="noopener noreferrer">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a href="mailto:rajalaminationtvl@gmail.com?subject=New%20Album%20Order%20from%20${encodeURIComponent(customerDetails.studioName)}&body=${encodeURIComponent(
              `Studio Name: ${customerDetails.studioName}\n` +
              `Phone: ${customerDetails.phone}\n` +
              `Materials:\n` +
              `- Glossy: ${customerDetails.materials.glossy.qty}\n` +
              `- Silk Matt: ${customerDetails.materials.silkMatt.qty}\n` +
              `- Feather: ${customerDetails.materials.feather.qty}\n` +
              `Files Uploaded: ${customerDetails.files.length}\n\n` +
              `Order Details:`
            )}" 
            class="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" rel="noopener noreferrer">
              <i class="fas fa-envelope"></i> Gmail
            </a>
          </div>
        </div>
        <p class="text-sm mt-3">Our team will contact you shortly to confirm your order.</p>
      </div>
    `;
    fileList.appendChild(successMsg);

    // Reset after 5 seconds
    setTimeout(() => {
      clearAllFiles();
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload mr-2"></i> Start Upload';
      uploadForm.reset();
      updateUploadButtonState();
      successMsg.remove();
    }, 5000);
  }
});