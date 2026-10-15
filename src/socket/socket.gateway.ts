import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Live stream client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    console.log(`Live stream disconnect: ${client.id}`);
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @MessageBody() roomName: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomName.room);
    console.log(`Client: ${client.id} joined room: ${roomName.room}`);
    return { status: "success", joined: roomName.room };
  }

  @SubscribeMessage("leaveRoom")
  HandleLeaveRoom(
    @MessageBody() roomName: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomName.room);
    console.log(`Client: ${client.id} left room: ${roomName.room}`);
    return { status: "success", left: roomName.room };
  }

  // @SubscribeMessage("message")
  // handleMessage(client: Socket, payload: any): string {
  //   return "Hello world!";
  // }
}
