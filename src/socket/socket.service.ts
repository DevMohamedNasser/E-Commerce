import { Injectable } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  emitToAll(event: string, data: any): void {
    this.socketGateway.server.emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any): void {
    this.socketGateway.server.to(room).emit(event, data);
  }
}
