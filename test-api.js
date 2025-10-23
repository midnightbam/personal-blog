async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/posts');
    const json = await response.json();
    console.log('API Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('API Error:', err);
  }
}

testAPI();
