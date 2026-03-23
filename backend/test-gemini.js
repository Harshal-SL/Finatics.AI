require('dotenv').config();

const testGeminiAPI = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('Testing Gemini API...');
  console.log('API Key:', apiKey ? (apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5)) : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Say hello in one sentence as a financial advisor' }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  try {
    console.log('Sending request to:', url.substring(0, 100) + '...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n📦 Full Response:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('\n✅ SUCCESS! AI Response:');
      console.log(text);
    } else {
      console.log('\n❌ API returned error');
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
    console.error(error.stack);
  }
};

testGeminiAPI();
