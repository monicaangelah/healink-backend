const express = require('express');
const mqtt = require('mqtt');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, 'pwa-deploy')));


// Supabase config - replace with your own credentials
const supabaseUrl = 'https://lcsfixsdqutppnmuyihf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2ZpeHNkcXV0cHBubXV5aWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NTI5MDQsImV4cCI6MjA2MzEyODkwNH0.32QqCWA3pBv5KpIWLUGUSVt44aF8OnkiaPyu0tK5QhE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Connect to MQTT broker
const mqttClient = mqtt.connect('http://mqtt.eclipseprojects.io');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('/datasensor');
});

// Handle new WebSocket connections
wss.on('connection', async (ws) => {
  console.log('🟢 WebSocket client connected');
  console.log('Current clients:', wss.clients.size);

  ws.on('close', () => {
    console.log('🔴 WebSocket client disconnected');
  });

  // Send recent history on connection
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'history', data }));
  }
});

// Handle incoming MQTT messages
mqttClient.on('message', async (topic, message) => {
  if (topic === '/datasensor') {
    const data = JSON.parse(message.toString());
    console.log('Data received:', data);

    // Save to Supabase
    const { error } = await supabase.from('sensor_data').insert([
      {
        temperature: data.temperature,
        bpm: data.bpm,
        spo2: data.spo2,
        created_at: new Date()
      }
    ]);
    if (error) console.error('Supabase insert error:', error);

    // Send to all connected WebSocket clients
    console.log('Sending to clients:', wss.clients.size);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'realtime', ...data }));
      }
    });
  }
});

// Optional HTTP endpoint as fallback (not required)
app.get('/api/data', async (req, res) => {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
