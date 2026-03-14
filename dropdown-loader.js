let automotiveData = null;

// Load automotive data from JSON
async function loadAutomotiveData() {
  try {
    const response = await fetch('automotive-data.json');
    automotiveData = await response.json();
    populateMakeDropdown();
  } catch (error) {
    console.error('Error loading automotive data:', error);
  }
}

// Populate make dropdown with manufacturers
function populateMakeDropdown() {
  const makeSelect = document.getElementById('make');
  
  automotiveData.manufacturers.forEach(manufacturer => {
    const option = document.createElement('option');
    option.value = manufacturer.name;
    option.textContent = manufacturer.name;
    makeSelect.appendChild(option);
  });

  makeSelect.addEventListener('change', populateYearDropdown);
}

// Populate year dropdown based on selected make
function populateYearDropdown() {
  const makeSelect = document.getElementById('make');
  const yearSelect = document.getElementById('year');
  const modelSelect = document.getElementById('model');
  
  // Clear year and model options
  yearSelect.innerHTML = '<option value="">Select Year</option>';
  modelSelect.innerHTML = '<option value="">Select Model</option>';

  if (!makeSelect.value) return;

  const selectedManufacturer = automotiveData.manufacturers.find(
    m => m.name === makeSelect.value
  );

  if (selectedManufacturer) {
    const years = Object.keys(selectedManufacturer.years).sort();
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    yearSelect.addEventListener('change', populateModelDropdown);
  }
}

// Populate model dropdown based on selected make and year
function populateModelDropdown() {
  const makeSelect = document.getElementById('make');
  const yearSelect = document.getElementById('year');
  const modelSelect = document.getElementById('model');

  modelSelect.innerHTML = '<option value="">Select Model</option>';

  if (!makeSelect.value || !yearSelect.value) return;

  const selectedManufacturer = automotiveData.manufacturers.find(
    m => m.name === makeSelect.value
  );

  if (selectedManufacturer && selectedManufacturer.years[yearSelect.value]) {
    const models = selectedManufacturer.years[yearSelect.value];
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  }
}

// Load data when page is ready
document.addEventListener('DOMContentLoaded', loadAutomotiveData);
