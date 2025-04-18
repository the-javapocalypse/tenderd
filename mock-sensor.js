// Mock Sensor for Vehicle Telemetry
// npm install socket.io-client

const { io } = require("socket.io-client");

// Replace with your actual server URL
const SOCKET_SERVER_URL = "http://localhost:3000";

// Connect to the server
const socket = io(SOCKET_SERVER_URL);

// Replace with the actual vehicle ID you want to monitor
const vehicleId = "67ffcfd150f65011cb32a3e4"; 

// Event handlers for connection status
socket.on("connect", () => {
  console.log("Sensor connected to server with socket ID:", socket.id);
  
  // Join the vehicle's sensor room
  socket.emit("join", { 
    room: vehicleId,
    type: "sensor"
  });
  
  console.log(`Sensor for vehicle ${vehicleId} connected - ignition set to ON`);
  
  // Function to send vehicle telemetry update
  const sendTelemetryUpdate = () => {
    // Generate random speed between 0-120 km/h
    // More realistic pattern - speeds don't jump dramatically between updates
    const lastSpeed = global.lastSpeed || 0;
    const maxChange = 10; // Maximum km/h change between updates
    const changeDirection = Math.random() > 0.5 ? 1 : -1;
    const change = Math.random() * maxChange * changeDirection;
    let newSpeed = Math.max(0, lastSpeed + change);
    newSpeed = Math.min(120, newSpeed); // Max speed 120 km/h
    
    global.lastSpeed = newSpeed;
    
    const telemetryData = {
      vehicleId: vehicleId,
      speedKm: Math.round(newSpeed) // Round to nearest integer
    };
    
    console.log("Sending telemetry update:", telemetryData);
    socket.emit("reportVehicleTelemetry", telemetryData);
  };
  
  // Send updates every 5 seconds
  const intervalId = setInterval(sendTelemetryUpdate, 5000);
  
  // Clean up interval on disconnect
  socket.on("disconnect", () => {
    clearInterval(intervalId);
    console.log("Sensor disconnected - ignition set to OFF");
  });
});

// Listen for user joined events
socket.on("user_joined", (data) => {
  console.log("User joined the sensor room:", data);
});

// Error handling
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nDisconnecting sensor from server...");
  socket.emit("leave", { 
    room: vehicleId,
    type: "sensor" 
  });
  socket.disconnect();
  process.exit(0);
});

console.log(`Starting vehicle sensor for vehicle ${vehicleId}...`); 