import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/SocketService/socket.service';
import { ServerToClientCommand } from '../entities/socket/serverToClient/ServerToClientCommand';
import { ServerToClientCommandType } from '../entities/socket/serverToClient/ServerToClientCommandType';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  data: any;
  ioConnection: any;
  onButtonClick(): void {
    let formDate = new Date(new Date().setDate(new Date().getDate() - 1));
    let toDate = new Date();

    this.sendMessage({
      fromDate: formDate,
      toDate: toDate
    })
  };

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.initIoConnection();
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onMessage()
      .subscribe((serverToClientCommand: ServerToClientCommand<any>) => {
        if (serverToClientCommand.commandType == ServerToClientCommandType.AllDataCommand) {
          this.data = serverToClientCommand.dataObject;
        }
      });

    this.socketService.onEvent(new Event('connect'))
      .subscribe(() => {
        console.log('connected');
      });
      
    this.socketService.onEvent(new Event('disconnect'))
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  public sendMessage(message: object): void {
    if (!message) {
      return;
    }

    this.socketService.send({
      commandType: 1,
      content: message
    });
  }
}