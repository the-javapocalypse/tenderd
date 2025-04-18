// Example client-side code for connecting to vehicle telemetry socket
// This example uses the socket.io-client library
// npm install socket.io-client

const { io } = require("socket.io-client");

// Replace with your actual server URL
const SOCKET_SERVER_URL = "http://localhost:3000";

// Connect to the server
const socket = io(SOCKET_SERVER_URL);

// Replace with the actual vehicle ID you want to monitor
const vehicleId = "6150c1a2e3812b001c123a56"; 

// Event handlers for connection status
socket.on("connect", () => {
  console.log("Connected to server with socket ID:", socket.id);
  
  // Join the vehicle's room to receive updates
  socket.emit("join", { room: vehicleId });
  
  // Notify that the vehicle is connected (turns ignition on)
  socket.emit("vehicleConnected", { vehicleId });
  console.log(`Vehicle ${vehicleId} connected, ignition turned ON`);
  
  // Example: Send vehicle telemetry update
  // This would typically come from the vehicle's GPS or other sensors
  const sendTelemetryUpdate = () => {
    const telemetryData = {
      vehicleId: vehicleId,
      speedKm: Math.floor(Math.random() * 100) // Random speed between 0-99 km/h
    };
    
    console.log("Sending telemetry update:", telemetryData);
    socket.emit("reportVehicleTelemetry", telemetryData);
  };
  
  // Send updates every 5 seconds (simulating vehicle data updates)
  const intervalId = setInterval(sendTelemetryUpdate, 5000);
  
  // Clean up interval on disconnect
  socket.on("disconnect", () => {
    clearInterval(intervalId);
  });
});

// Listen for telemetry updates for the vehicle
socket.on("vehicleTelemetryUpdated", (data) => {
  console.log("Received vehicle telemetry update:", data);
  // Update UI or perform actions based on the data
});

// Listen for ignition status changes
socket.on("vehicleIgnitionChanged", (data) => {
  console.log("Vehicle ignition status changed:", data);
  // Update UI to show if vehicle is turned on/off
});

// Listen for user joined events
socket.on("user_joined", (data) => {
  console.log("User joined the vehicle room:", data);
});

// Error handling
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Function to gracefully disconnect the vehicle
function disconnectVehicle() {
  // Notify that the vehicle is disconnecting (turns ignition off)
  socket.emit("vehicleDisconnected", { vehicleId });
  console.log(`Vehicle ${vehicleId} disconnected, ignition turned OFF`);
  
  // Leave the room 
  socket.emit("leave", { room: vehicleId });
  
  // Disconnect from the server
  socket.disconnect();
}

// Cleanup when the app is closed
process.on("SIGINT", () => {
  console.log("Disconnecting from server...");
  disconnectVehicle();
  process.exit(0);
}); 