import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import type { Container } from "../../container";
import type { ObjectId } from "mongodb";

// todo: add socket to container
export class SocketService {
  private io: SocketServer;
  private readonly container: Container;

  constructor(server: HttpServer, container: Container) {
    this.io = new SocketServer(server);
    this.container = container;
    this.setupSocketEvents();
    console.log("Socket.IO server initialized and running");
  }

  private setupSocketEvents(): void {
    this.io.on("connection", (socket) => {
      console.log("A client connected", socket.id);

      // Handle connection events
      this.handleConnectionEvents(socket);

      // Handle vehicle events
      this.handleVehicleEvents(socket);

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }

  private handleConnectionEvents(socket: any) {
    // Handle client join event
    socket.on("join", (data: { room: string; type: "sensor" | "client" }) => {
      const { room, type } = data;
      const roomId = type === "sensor" ? `${room}-sensor` : `${room}-client`;

      socket.join(roomId);
      console.log(`${type} ${socket.id} joined room: ${roomId}`);

      // If this is a sensor connecting, set isIgnitionOn to true
      if (type === "sensor") {
        this.handleSensorConnection(room);
      }

      // Notify room of new connection
      this.io?.to(roomId).emit("user_joined", {
        userId: socket.id,
        room: roomId,
        type,
      });
    });

    // Handle client leave event
    socket.on("leave", (data: { room: string; type: "sensor" | "client" }) => {
      const { room, type } = data;
      const roomId = type === "sensor" ? `${room}-sensor` : `${room}-client`;

      socket.leave(roomId);
      console.log(`${type} ${socket.id} left room: ${roomId}`);

      // If this is a sensor disconnecting, set isIgnitionOn to false
      if (type === "sensor") {
        this.handleSensorDisconnection(room);
      }

      // Notify room of client leaving
      this.io?.to(roomId).emit("user_left", {
        userId: socket.id,
        room: roomId,
        type,
      });
    });
  }

  private async handleSensorConnection(vehicleId: string) {
    try {
      // Set isIgnitionOn to true when sensor connects
      const vehicleService = this.container.vehicleService;
      await vehicleService.update(vehicleId, { isIgnitionOn: true });

      // Broadcast ignition status to clients
      this.io.to(`${vehicleId}-client`).emit("vehicleIgnitionUpdated", {
        vehicleId,
        isIgnitionOn: true,
        timestamp: new Date(),
      });

      console.log(`Vehicle ${vehicleId} ignition set to ON`);
    } catch (error) {
      console.error("Error updating vehicle ignition status:", error);
    }
  }

  private async handleSensorDisconnection(vehicleId: string) {
    try {
      // Set isIgnitionOn to false when sensor disconnects
      const vehicleService = this.container.vehicleService;
      await vehicleService.update(vehicleId, { isIgnitionOn: false });

      // Broadcast ignition status to clients
      this.io.to(`${vehicleId}-client`).emit("vehicleIgnitionUpdated", {
        vehicleId,
        isIgnitionOn: false,
        timestamp: new Date(),
      });

      console.log(`Vehicle ${vehicleId} ignition set to OFF`);
    } catch (error) {
      console.error("Error updating vehicle ignition status:", error);
    }
  }

  private handleVehicleEvents(socket: any) {
    socket.on(
      "reportVehicleTelemetry",
      async (data: { vehicleId: string | ObjectId; speedKm: number }) => {
        try {
          const { vehicleId, speedKm } = data;

          if (!vehicleId || typeof speedKm !== "number") {
            console.error("Invalid telemetry data", data);
            return;
          }

          console.log(
            `Received telemetry update for vehicle ${vehicleId}: speed (km/h)=${speedKm}`
          );

          // Update vehicle speed in database
          const vehicleService = this.container.vehicleService;
          await vehicleService.update(vehicleId.toString(), { speedKm });

          // Get current ignition status
          const vehicle = await vehicleService.getById(vehicleId.toString());
          const isIgnitionOn = vehicle?.isIgnitionOn || false;

          // Broadcast the updated telemetry to clients in the vehicle client room
          this.io.to(`${vehicleId}-client`).emit("vehicleTelemetryUpdated", {
            vehicleId,
            speedKm,
            isIgnitionOn,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error updating vehicle telemetry:", error);
        }
      }
    );
  }

  public getIO(): SocketServer {
    return this.io;
  }

  // Public method to emit events to all clients
  emitToAll(event: string, data: any) {
    if (!this.io) {
      console.error("Socket.IO server not initialized");
      return;
    }

    this.io.emit(event, data);
  }

  // Public method to emit events to a specific room
  emitToRoom(room: string, event: string, data: any) {
    if (!this.io) {
      console.error("Socket.IO server not initialized");
      return;
    }

    this.io.to(room).emit(event, data);
  }

  // Public method to emit events to a specific socket
  emitToSocket(socketId: string, event: string, data: any) {
    if (!this.io) {
      console.error("Socket.IO server not initialized");
      return;
    }

    this.io.to(socketId).emit(event, data);
  }
}
