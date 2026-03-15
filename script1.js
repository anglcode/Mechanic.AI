async function call() {
  // Get form values from dropdowns and inputs
  const make = document.getElementById('make').value;
  const year = document.getElementById('year').value;
  const model = document.getElementById('model').value;
  const km = document.getElementById('km').value;
  const problems = document.getElementById('problems').value;

  // Validate required fields
  if (!make || !model || !year || !km) {
    alert('Please fill in all required fields (Make, Model, Year, Total KM)');
    return;
  }

  // Set button to loading state
  const diagnoseBtn = document.querySelector('.btn-diagnose');
  const originalText = diagnoseBtn.textContent;
  diagnoseBtn.disabled = true;
  diagnoseBtn.textContent = 'Loading...';

  try {
    // Call server endpoint to generate diagnosis
    const response = await fetch('https://mechanicai-production-0470.up.railway.app/api/diagnose-vehicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        make,
        year,
        model,
        km,
        problems
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate diagnosis from server');
    }

    const data = await response.json();
    const diagnosis = data.diagnosis;

    console.log('Diagnosis received from server:', diagnosis);

    // Store result in sessionStorage for output page
    const vehicleData = {
      make,
      model,
      year,
      km,
      problems,
      diagnosis: diagnosis
    };
    
    console.log('Storing in sessionStorage:', vehicleData);
    sessionStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    
    // Verify it was stored
    const stored = sessionStorage.getItem('vehicleData');
    console.log('Verified stored data:', stored);

    // Small delay to ensure storage completes, then navigate
    setTimeout(() => {
      window.location.href = 'vehicle-health-output.html';
    }, 100);
  } catch (error) {
    console.error('Error calling server:', error);
    alert('Error: Unable to generate diagnosis. Please ensure the server is running.');
    
    // Reset button state on error
    diagnoseBtn.disabled = false;
    diagnoseBtn.textContent = originalText;
  }
}