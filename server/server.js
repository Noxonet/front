
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    console.log('Sending email with params:', { to, subject, text });
    const response = await axios.post(
      'https://api.sender.net/v3/emails', // به‌روزرسانی به endpoint جدید
      {
        to: [{ email: to }],
        from: { email: process.env.SENDER_FROM_EMAIL },
        subject,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SENDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Sender API Response:', response.data);
    res.status(200).json({ message: 'Email sent successfully', data: response.data });
  } catch (error) {
    console.error('Sender API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    res.status(500).json({
      error: 'Failed to send email',
      details: error.response?.data?.message || error.message,
      status: error.response?.status || 'Unknown',
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));