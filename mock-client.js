// Mock Client for Monitoring Vehicle Telemetry
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
  console.log("Client connected to server with socket ID:", socket.id);
  
  // Join the vehicle's client room
  socket.emit("join", { 
    room: vehicleId,
    type: "client"
  });
  
  console.log(`Monitoring vehicle ${vehicleId}`);
});

// Listen for telemetry updates for the vehicle
socket.on("vehicleTelemetryUpdated", (data) => {
  console.log("📊 TELEMETRY UPDATE:");
  console.log(`  Vehicle: ${data.vehicleId}`);
  console.log(`  Speed: ${data.speedKm} km/h`);
  console.log(`  Ignition: ${data.isIgnitionOn ? "ON" : "OFF"}`);
  console.log(`  Time: ${new Date(data.timestamp).toLocaleTimeString()}`);
  console.log("------------------------");
  
  // Here you would update your UI or perform actions based on the data
});

// Listen for ignition state changes
socket.on("vehicleIgnitionUpdated", (data) => {
  console.log("🔑 IGNITION UPDATE:");
  console.log(`  Vehicle: ${data.vehicleId}`);
  console.log(`  Ignition: ${data.isIgnitionOn ? "ON" : "OFF"}`);
  console.log(`  Time: ${new Date(data.timestamp).toLocaleTimeString()}`);
  console.log("------------------------");
  
  // Here you would update your UI to show the ignition state
});

// Listen for user joined events
socket.on("user_joined", (data) => {
  console.log("User joined the client room:", data);
});

socket.on("user_left", (data) => {
  console.log("User left the client room:", data);
});

// Error handling
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nDisconnecting client from server...");
  socket.emit("leave", { 
    room: vehicleId,
    type: "client" 
  });
  socket.disconnect();
  process.exit(0);
});

console.log(`Starting vehicle monitoring client for vehicle ${vehicleId}...`); 