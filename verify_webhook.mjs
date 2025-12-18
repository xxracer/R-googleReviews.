import axios from 'axios';

async function testWebhook() {
  const url = 'http://localhost:3001/api/send-message';
  const data = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message to the webhook.',
  };

  try {
    const response = await axios.post(url, data);
    console.log('Request successful.');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error sending test request:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testWebhook();
