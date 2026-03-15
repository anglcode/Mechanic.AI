const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to generate vehicle health diagnosis
app.post('/api/diagnose-vehicle', async (req, res) => {
  try {
    const { make, year, model, km, problems } = req.body;

    // Validate required fields
    if (!make || !year || !model || !km) {
      return res.status(400).json({
        error: 'Missing required fields: make, year, model, km'
      });
    }

    // Create prompt with vehicle information
    const prompt = `I have a ${year} ${make} ${model} vehicle with ${km} kilometers on the odometer. ${problems ? `Additional issues or error codes: ${problems}` : 'No additional issues reported.'} 
  
Please provide a comprehensive vehicle health assessment including:
1. Overall health score (1-5, where 1 is critical and 5 is excellent)
2. A list of identified problems based on the mileage and reported issues, 3 most pressing first. The problem names should be frased as the jobs to be completed in order to improve the issue. For these jobs, include the kilometers they should be completed at in the title.
3. For each problem, rate the severity (1-5) and complexity to fix (1-5). The complexity to fix should be based on the average cost and time to complete the repair, with 1 being a simple DIY fix and 5 being a major repair that requires professional service and significant downtime.
4. If there is a stated problem, assume that all components that could not cause the problem are in good health and do not include them in the diagnosis. For example, if the problem is a brake issue, do not include problems related to the engine or transmission.
5. If there are no stated problems, provide a general recommendation for maintenance based on the mileage and vehicle age, assuming all standard maintence has been completed up to this point.
6. For each new prompt, assume the vehicle has no prior issues and is in good health, except for the problems stated in the prompt. Do not carry over any issues from previous prompts.


Format your response as JSON with this structure:
{
  "overallHealth": <number 1-5>,
  "problems": [
    {
      "name": "Problem name",
      "severity": <number 1-5>,
      "complexity": <number 1-5>
    }
  ],
  "recommendations": "Your recommendations here"
}`;

    // Call OpenAI API with GPT-4o
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 5000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check if response has expected structure
    if (!openaiResponse.data || !openaiResponse.data.choices || !openaiResponse.data.choices[0]) {
      console.error('Unexpected OpenAI response structure:', openaiResponse.data);
      return res.status(500).json({
        error: 'Unexpected response from OpenAI API',
        details: 'Response missing expected structure. Check API key validity.',
        responseData: openaiResponse.data
      });
    }

    const diagnosisContent = openaiResponse.data.choices[0].message.content;

    console.log('API Response received:', diagnosisContent);

    // Return diagnosis to client
    res.json({
      success: true,
      diagnosis: diagnosisContent
    });
  } catch (error) {
    console.error('Error calling ChatGPT:', error.message);
    res.status(500).json({
      error: 'Failed to generate diagnosis',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vehicle Health Diagnostic Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/diagnose-vehicle`);
});
