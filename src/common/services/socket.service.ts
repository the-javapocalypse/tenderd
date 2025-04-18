import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import type { Container } from "../../container";

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
    socket.on("join", (data: { room: string }) => {
      socket.join(data.room);
      console.log(`Client ${socket.id} joined room: ${data.room}`);

      // Notify room of new connection
      this.io?.to(data.room).emit("user_joined", {
        userId: socket.id,
        room: data.room,
      });
    });

    // Handle client leave event
    socket.on("leave", (data: { room: string }) => {
      socket.leave(data.room);
      console.log(`Client ${socket.id} left room: ${data.room}`);

      // Notify room of client leaving
      this.io?.to(data.room).emit("user_left", {
        userId: socket.id,
        room: data.room,
      });
    });
  }

  private handleVehicleEvents(socket: any) {}

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
