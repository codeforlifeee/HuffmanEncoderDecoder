import { HuffmanCoder } from './huffman.js';

let currentFile = null;
const coder = new HuffmanCoder();

// Initialize the application
window.addEventListener('load', () => {
    initializeElements();
    setupEventListeners();
});

function initializeElements() {
    // Get references to DOM elements
    window.treearea = document.getElementById('treearea');
    window.encode = document.getElementById('encode');
    window.decode = document.getElementById('decode');
    window.temptext = document.getElementById('temptext');
    window.upload = document.getElementById('uploadedFile');
    window.uploadArea = document.getElementById('uploadArea');
}

function setupEventListeners() {
    // File upload events
    upload.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Button events
    encode.addEventListener('click', handleEncode);
    decode.addEventListener('click', handleDecode);
    
    // Initial button state
    updateButtonStates();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        currentFile = file;
        showFileSelected(file.name);
        updateButtonStates();
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            currentFile = file;
            upload.files = files; // Update the input element
            showFileSelected(file.name);
            updateButtonStates();
        } else {
            showError('Please select a text file (.txt)');
        }
    }
}

function showFileSelected(fileName) {
    const uploadArea = document.getElementById('uploadArea');
    
    // Remove existing file name if any
    const existingFileName = uploadArea.querySelector('.file-name');
    if (existingFileName) {
        existingFileName.remove();
    }
    
    // Add new file name
    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';
    fileNameDiv.textContent = `Selected: ${fileName}`;
    uploadArea.appendChild(fileNameDiv);
    
    // Update status
    showStatus('File uploaded successfully! Choose an operation below.', 'success');
}

function updateButtonStates() {
    const hasFile = currentFile !== null;
    encode.disabled = !hasFile;
    decode.disabled = !hasFile;
}

function handleEncode() {
    if (!validateFile()) return;
    
    setButtonLoading(encode, true);
    showStatus('Encoding file...', 'loading');
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const text = event.target.result;
            
            if (text.length === 0) {
                showError('File is empty! Please upload a file with content.');
                return;
            }
            
            const [encoded, treeStructure, info] = coder.encode(text);
            const fileName = currentFile.name.split('.')[0] + '_encoded.txt';
            
            downloadFile(fileName, encoded);
            displayTreeStructure(treeStructure);
            showStatus(info, 'success');
            
        } catch (error) {
            showError('Error encoding file: ' + error.message);
        } finally {
            setButtonLoading(encode, false);
        }
    };
    
    fileReader.onerror = function() {
        showError('Error reading file');
        setButtonLoading(encode, false);
    };
    
    fileReader.readAsText(currentFile, "UTF-8");
}

function handleDecode() {
    if (!validateFile()) return;
    
    setButtonLoading(decode, true);
    showStatus('Decoding file...', 'loading');
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const text = event.target.result;
            
            if (text.length === 0) {
                showError('File is empty! Please upload a file with content.');
                return;
            }
            
            const [decoded, treeStructure, info] = coder.decode(text);
            const fileName = currentFile.name.split('.')[0] + '_decoded.txt';
            
            downloadFile(fileName, decoded);
            displayTreeStructure(treeStructure);
            showStatus(info, 'success');
            
        } catch (error) {
            showError('Error decoding file: ' + error.message);
        } finally {
            setButtonLoading(decode, false);
        }
    };
    
    fileReader.onerror = function() {
        showError('Error reading file');
        setButtonLoading(decode, false);
    };
    
    fileReader.readAsText(currentFile, "UTF-8");
}

function validateFile() {
    if (!currentFile) {
        showError('Please select a file first!');
        return false;
    }
    return true;
}

function setButtonLoading(button, isLoading) {
    const originalText = button.textContent;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<div class="loading"></div>Processing...';
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
        updateButtonStates();
    }
}

function showStatus(message, type = 'info') {
    const statusElement = temptext;
    statusElement.className = 'status-content';
    
    // Remove placeholder content
    const placeholder = statusElement.querySelector('.status-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add appropriate styling
    if (type === 'success') {
        statusElement.classList.add('status-success');
    } else if (type === 'error') {
        statusElement.classList.add('status-error');
    }
    
    // Add loading spinner for loading state
    if (type === 'loading') {
        statusElement.innerHTML = '<div class="loading"></div>' + message;
    } else {
        statusElement.textContent = message;
    }
}

function showError(message) {
    showStatus(message, 'error');
}

function displayTreeStructure(treeStructure) {
    const treeElement = treearea;
    
    // Remove placeholder content
    const placeholder = treeElement.querySelector('.tree-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add animation class and display tree
    treeElement.className = 'tree-content tree-animate';
    treeElement.textContent = treeStructure;
}

function downloadFile(fileName, data) {
    try {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download failed:', error);
        showError('Failed to download file');
    }
}