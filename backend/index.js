const express = require('express');
const mqtt = require('mqtt');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static frontend files
app.use(express.static('public'));

// Supabase config - ganti dengan milikmu
const supabaseUrl = 'https://lcsfixsdqutppnmuyihf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2ZpeHNkcXV0cHBubXV5aWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NTI5MDQsImV4cCI6MjA2MzEyODkwNH0.32QqCWA3pBv5KpIWLUGUSVt44aF8OnkiaPyu0tK5QhE';
const supabase = createClient(supabaseUrl, supabaseKey);

// MQTT broker connection
const mqttClient = mqtt.connect('mqtt://reksti.profybandung.cloud:1883');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('/datasensor');
});

// Saat client baru connect ke WebSocket, kirim history data
wss.on('connection', async (ws) => {
  console.log('New WebSocket client connected');

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error) {
    ws.send(JSON.stringify({ type: 'history', data }));
  }
});

// MQTT pesan diterima
mqttClient.on('message', async (topic, message) => {
  if (topic === '/datasensor') {
    const data = JSON.parse(message.toString());
    console.log('Data received:', data);

    // Simpan data ke Supabase
    const { error } = await supabase.from('sensor_data').insert([
      {
        temperature: data.temperature,
        bpm: data.bpm,
        spo2: data.spo2,
        created_at: new Date()
      }
    ]);
    if (error) console.error('Supabase insert error:', error);

    // Kirim data realtime ke semua client WebSocket dengan type realtime
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'realtime', ...data }));
      }
    });
  }
});

// Endpoint HTTP untuk fallback (tidak wajib dipakai)
app.get('/api/data', async (req, res) => {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Jalankan server backend
server.listen(3000, () => {
  console.log('Backend running at http://localhost:3000');
});
