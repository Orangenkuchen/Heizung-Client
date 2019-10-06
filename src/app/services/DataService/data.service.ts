import { Injectable } from '@angular/core';
import { WebsocketService } from '../WebSocket/web-socket.service';
import { ServerToClientCommandType } from 'src/app/entities/socket/serverToClient/ServerToClientCommandType';
import { HeaterDataType } from 'src/app/entities/HeaterDataType';

export interface DataPoint {
    description: string;
    timestamp: Date; 
    value: Number;
    unit: string;
  }

@Injectable({
  providedIn: 'root'
})
export class DataService {
    // #region fields
    // #endregion

    // #region currentState
    /**
     * Der aktuelle Status von der Heizung
     */
    public currentState: DataPoint = { description: null, timestamp: null, unit: null, value: null };
    // #endregion

    // #region currentExhaustTemperature
    /**
     * Die aktuelle Temperatur vom Abgas
     */
    public currentExhaustTemperature: DataPoint = { description: null, timestamp: null, unit: null, value: null };
    // #endregion

    // #region currentBufferTopTemperature
    /**
     * Die aktuelle Temperatur im Puffer oben
     */
    public currentBufferTopTemperature: DataPoint = { description: null, timestamp: null, unit: null, value: null };
    // #endregion

    // #region currentBufferBottomTemperature
    /**
     * Die aktuelle Temperatur im Puffer unten
     */
    public currentBufferBottomTemperature: DataPoint = { description: null, timestamp: null, unit: null, value: null };
    // #endregion

    // #region currentOutsideTemperature
    /**
     * Die aktuelle Außentemperatur
     */
    public currentOutsideTemperature: DataPoint = { description: null, timestamp: null, unit: null, value: null };

    private websocketService: WebsocketService;
    // #endregion

    // #region dataHashTable
    /**
     * Hashtable mit den Werten von der Heizung
     */
    public dataHashTable: { [heaterType: number]: any };
    // #endregion

    // #region ctor
    /**
     * Initilisiert den Service
     * 
     * @param websocketService Service für Websocketkommunikation
     */
    public constructor(websocketService: WebsocketService) {
        this.dataHashTable = {};
        this.websocketService = websocketService;

        websocketService.webSocket.subscribe((messageEvent: MessageEvent) => this.handleOnWebSocketMessage(this, messageEvent));

        setTimeout(() => {
            this.reqeustData(30);
        }, 100);

        setInterval(() => {
            this.reqeustData(30);
        }, 1000 * 60 * 15);
    }
    // #endregion

    // #region handleOnWebSocketMessage
    /**
     * Arbeite einen Nachricht vom Websocketserver ab
     * 
     * @param messageEvent Die Nachricht vom Server
     */
    private handleOnWebSocketMessage(that: any, messageEvent: MessageEvent): void {
        let serverToClientCommand = JSON.parse(messageEvent.data);

        if (serverToClientCommand.commandType == ServerToClientCommandType.AllDataCommand) {
            that.convertRevicedData(serverToClientCommand.dataObject);
    
            that.dataHashTable = serverToClientCommand.dataObject;


            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Heizstatus, that.currentState);
            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Abgastemperatur, that.currentExhaustTemperature);
            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Puffer_oben, that.currentBufferTopTemperature);
            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Puffer_unten, that.currentBufferBottomTemperature);
            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Aussentemperatur, that.currentOutsideTemperature);
    
            // Highchart
            /*this.options.series[0].data.length = 0;
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
            });*/
        }
    }
    // #endregion

    // #region convertRevicedData
    /**
     * Wandelt das Datum von den Messwerten um und fügt nullwerte ein
     * 
     * @param dataObject Die Empfangen Daten vom Server
     */
    private convertRevicedData(dataObject: any): void {
        for(let heaterTypeId in dataObject) {
            let heaterType = dataObject[heaterTypeId];

            let dataWithGaps = [];
            let lastDate: Date;

            heaterType.data.forEach((dataPoint) => {
            dataPoint.timestamp = new Date(dataPoint.timestamp);

            if (lastDate != null) {
                // @ts-ignore
                if (dataPoint.timestamp - lastDate > 60 * 60 * 1000) {
                let tempDate = new Date(lastDate.setMilliseconds(lastDate.getMilliseconds() + 1));

                dataWithGaps.push({ timestamp: tempDate, value: null });
                }
            }

            dataWithGaps.push(dataPoint);
            lastDate = dataPoint.timestamp;
            });

            heaterType.data = dataWithGaps;
        }
    }
    // #endregion

    // #region fillCurrentValue
    /**
     * Füllt eine Variable für den aktuellen Wert von einem Messwert
     * 
     * @param dataValues Hashtable welche vom Server empfangen wurde
     * @param dataType Der Typ vom Messwert
     * @param outputVariable Die Vairable, in die der aktuellste Wert geschrieben werden soll
     */
    private fillCurrentValue(dataValues: {[dataType: number]: any}, dataType: HeaterDataType, outputVariable): void {
        if (typeof dataValues[dataType] === "object") {
            let heaterStateData = dataValues[dataType];

            if (heaterStateData.data.length > 0) {
                let latestValue = heaterStateData.data[heaterStateData.data.length - 1];

                outputVariable.description = heaterStateData.description;
                outputVariable.timestamp = latestValue.timestamp;
                outputVariable.unit = heaterStateData.unit;
                outputVariable.value = latestValue.value;
            }
        }
    }
    // #endregion

    // #region requestData
    /**
     * Ermittelt die Daten für die angegebene Anzahl an Tage rückwrikend
     * 
     * @param dayCount Die Anzhal der Tage
     */
    public reqeustData(dayCount: number) {
        let formDate = new Date(new Date().setDate(new Date().getDate() - dayCount));
        let toDate = new Date();

        let command: any = {
            commandType: 1,
            dataObject: {
                fromDate: formDate,
                toDate: toDate
            }
        };

        this.websocketService.webSocket.next(command);
    }
    // #endregion
}
