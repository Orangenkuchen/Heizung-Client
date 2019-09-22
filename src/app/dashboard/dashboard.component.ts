import { Component, OnInit, ɵisBoundToModule__POST_R3__ } from '@angular/core';
import { SocketService } from '../services/SocketService/socket.service';
import { ServerToClientCommand } from '../entities/socket/serverToClient/ServerToClientCommand';
import { ServerToClientCommandType } from '../entities/socket/serverToClient/ServerToClientCommandType';
import { WebsocketService } from '../services/WebSocket/web-socket.service';
import { Subject } from 'rxjs';
import * as Highcharts from 'highcharts';
//import * as Boost from 'highcharts/modules/boost';
//import * as noData from 'highcharts/modules/no-data-to-display';
//import * as More from 'highcharts/highcharts-more';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

export interface LatestValue {
  description: string;
  timestamp: Date; 
  value: Number;
  unit: string;
}

//Boost.factory(Highcharts);
//noData.factory(Highcharts);
//More.factory(Highcharts);
//noData.factory(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  data: any;
  lastData: Array<LatestValue> = new Array<LatestValue>();
  webSocket: Subject<MessageEvent>;

  public options: any = {
    chart: {
      type: 'line',
      height: 700
    },
    title: {
      text: 'Heizungswerte (24h)'
    },
    credits: {
      enabled: true
    },
    tooltip: {
      formatter: function() {
        return `${Math.round(this.y.toFixed(2) * 10) / 10} °C ${Highcharts.dateFormat('%e %b %y %H:%M:%S', this.x)}`;
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {
        formatter: function() {
          return Highcharts.dateFormat('%e %b %y', this.value);
        }
      }
    },
    yAxis: {
      title: {
        text: '°C'
      }
    },
    series: [
      {
        name: 'Abgastemperatur',
        turboThreshold: 500000,
        data: []
      },
      {
        name: 'Puffer oben',
        turboThreshold: 500000,
        data: []
      },
      {
        name: 'Puffer unten',
        turboThreshold: 500000,
        data: []
      },
      {
        name: 'Außentemperatur',
        turboThreshold: 500000,
        data: []
      },
    ],
    plotOptions: {
        series: {
            gapSize: 5,
            gapUnit: 30 * 60 * 1000
        }
    },
  }

  constructor(private socketService: SocketService, private websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.initIoConnection();
    
    setTimeout(() => {
      let formDate = new Date(new Date().setDate(new Date().getDate() - 1));
      let toDate = new Date();

      this.sendMessage({
        fromDate: formDate,
        toDate: toDate
      });
    }, 1000);
  }

  private initIoConnection(): void {
    this.webSocket = this.websocketService.createWebsocket();

    this.webSocket.subscribe((messageEvent) => {
      let serverToClientCommand = JSON.parse(messageEvent.data);
      
      if (serverToClientCommand.commandType == ServerToClientCommandType.AllDataCommand) {
        for(let heaterTypeId in serverToClientCommand.dataObject) {
          let heaterType = serverToClientCommand.dataObject[heaterTypeId];

          let dataWithGaps = [];
          let lastDate: Date;

          heaterType.data.forEach((dataPoint) => {
            dataPoint.timestamp = new Date(dataPoint.timestamp);

            if (lastDate != null) {
              // @ts-ignore
              if (dataPoint.timestamp - lastDate > 30 * 60 * 1000) {
                let tempDate = new Date(lastDate.setMilliseconds(lastDate.getMilliseconds() + 1));

                dataWithGaps.push({ timestamp: tempDate, value: null });
              }
            }

            dataWithGaps.push(dataPoint);
            lastDate = dataPoint.timestamp;
          });

          heaterType.data = dataWithGaps;
        }

        this.data = serverToClientCommand.dataObject;

        let latetstAbgasValue: LatestValue = {
          description: this.data[3].description,
          timestamp: this.data[3].data[this.data[3].data.length - 1].timestamp,
          value: this.data[3].data[this.data[3].data.length - 1].value,
          unit: this.data[3].unit
        }
        this.lastData.push(latetstAbgasValue);

        let latetstPufferObenValue: LatestValue = {
          description: this.data[20].description,
          timestamp: this.data[20].data[this.data[20].data.length - 1].timestamp,
          value: this.data[20].data[this.data[20].data.length - 1].value,
          unit: this.data[20].unit
        }
        this.lastData.push(latetstPufferObenValue);

        let latetstPufferUntenValue: LatestValue = {
          description: this.data[21].description,
          timestamp: this.data[21].data[this.data[21].data.length - 1].timestamp,
          value: this.data[21].data[this.data[21].data.length - 1].value,
          unit: this.data[21].unit
        }
        this.lastData.push(latetstPufferUntenValue);

        let latetstBetriebsstundenValue: LatestValue = {
          description: this.data[30].description,
          timestamp: this.data[30].data[this.data[21].data.length - 1].timestamp,
          value: this.data[30].data[this.data[21].data.length - 1].value,
          unit: this.data[30].unit
        }
        this.lastData.push(latetstBetriebsstundenValue);

        // Highchart
        this.options.series[0].data.length = 0;
        this.data[3].data.forEach((dataPoint) => {
          let hightChartPoint = [];

          hightChartPoint.push(dataPoint.timestamp.getTime());
          hightChartPoint.push(dataPoint.value);

          this.options.series[0].data.push(hightChartPoint);
        });

        this.options.series[1].data.length = 0;
        this.data[20].data.forEach((dataPoint) => {
          let hightChartPoint = [];

          hightChartPoint.push(dataPoint.timestamp.getTime());
          hightChartPoint.push(dataPoint.value);

          this.options.series[1].data.push(hightChartPoint);
        });

        this.options.series[2].data.length = 0;
        this.data[21].data.forEach((dataPoint) => {
          let hightChartPoint = [];

          hightChartPoint.push(dataPoint.timestamp.getTime());
          hightChartPoint.push(dataPoint.value);

          this.options.series[2].data.push(hightChartPoint);
        });

        this.options.series[3].data.length = 0;
        this.data[28].data.forEach((dataPoint) => {
          let hightChartPoint = [];

          hightChartPoint.push(dataPoint.timestamp.getTime());
          hightChartPoint.push(dataPoint.value);

          this.options.series[3].data.push(hightChartPoint);
        });

        Highcharts.chart('container', this.options);
      }
    }, () => {
      console.log('Error');
    }, () => {
      console.log('disconnected');
    })

    /*this.webSocket.subscribe((serverToClientCommand: ServerToClientCommand<any>) => {
        if (serverToClientCommand.commandType == ServerToClientCommandType.AllDataCommand) {
          this.data = serverToClientCommand.dataObject;
        }
      });*/
  }

  public sendMessage(message: object): void {
    if (!message) {
      return;
    }

    //this.webSocket.next(messageEvent);

    let command: any = {
      commandType: 1,
      dataObject: message
    };

    this.webSocket.next(command);
  }
}