import { Injectable } from '@angular/core';
import { WebsocketService } from '../WebSocket/web-socket.service';
import { ServerToClientCommandType } from 'src/app/entities/socket/serverToClient/ServerToClientCommandType';
import { HeaterDataType } from 'src/app/entities/HeaterDataType';
import * as Enumerable from 'linq';
import * as Moment from 'moment-timezone';

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
    /**
     * Array mit Callbacks welche ausgeführt werden, wenn die Daten vom Service aktualisiert wurden
     */
    private onDataChangedCallbacks = new Array<() => void>();
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
    // #endregion

    // #region totalRunTimeHour
    /**
     * Die insgesamte Anzahl an Betriebsstunden
     */
    public totalRunTimeHour: DataPoint = { description: null, timestamp: null, unit: null, value: null };
    // #endregion

    // #region totalRunTimeByDay
    /**
     * Die Betriebsstunden pro Tag
     */
    public totalRunTimeByDay: Array<number> = new Array<number>();
    // #endregion

    // #region websocketService
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
        }, 1000);

        setInterval(() => {
            this.reqeustData(30);
        }, 1000 * 60 * 15);
    }
    // #endregion

    // #region addOnDataChangeCallback
    /**
     * Fügt ein Callback hinzu welches aufgerufen wird, wenn die Daten vom Service sich ändern
     * 
     * @param callback Das Callback welches hinzugefügt werden soll
     * @returns Gibt die unsubscribefunktion zurück
     */
    public addOnDataChangeCallback(callback: () => void): () => void {
        let unsubscribe: () => void;
        let that = this;

        this.onDataChangedCallbacks.push(callback);

        unsubscribe = () => {
            let index = that.onDataChangedCallbacks.indexOf(callback);

            that.onDataChangedCallbacks.splice(index, 1);
        };

        return unsubscribe;
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
            that.fillCurrentValue(that.dataHashTable, HeaterDataType.Betriebsstunden, that.totalRunTimeHour);

            if (typeof that.dataHashTable[HeaterDataType.Betriebsstunden] != "undefined") {
                let groupArray = Enumerable.from(that.dataHashTable[HeaterDataType.Betriebsstunden].data)
                // @ts-ignore
                                           .where((element) => { return element.value != null })
                // @ts-ignore
                                           .groupBy((dataPoint) => { return new Moment(dataPoint.timestamp).format("YYYY.MM.DD"); });

                that.totalRunTimeByDay.length = 0;
                let maxLastDayValue: number;

                groupArray.forEach((element) => {
                    let valueDayLinqList = element.select((dataPoint) => { return dataPoint.value });

                    let minDayValue = valueDayLinqList.min();
                    let maxDayValue = valueDayLinqList.max();

                    if (maxLastDayValue != null) {
                        if (maxLastDayValue != minDayValue) {
                            minDayValue = maxLastDayValue;
                        }
                    }

                    // @ts-ignore
                    let date = new Moment(element.firstOrDefault().timestamp);
                    
                    that.totalRunTimeByDay.push({ "date": date, "runHours": maxDayValue - minDayValue, "absoluteHours": maxDayValue });
                    maxLastDayValue = maxDayValue;
                });

                /*that.dataHashTable[HeaterDataType.Betriebsstunden].data.forEach((element) => {
                    if (lastDateTime == null) {
                        lastDateTime = element.timestamp;
                    }

                    if (minValueOfDay == null) {
                        minValueOfDay = element.value;
                    }
                    else if (element.value < minValueOfDay) {
                        minValueOfDay = element.value;
                    }
                    if (element.value > maxValueOfDay) {
                        maxValueOfDay = element.value;
                    }

                    if (lastDateTime.getDate() != element.timestamp.getDate()) {
                        let moment = new Moment(element.timestamp).startOf('day');

                        that.totalRunTimeByDay.push({ "date": moment, "runHours"{ "date": moment, "runHours": maxValueOfDay - minValueOfDay, "absoluteHours": maxValueOfDay }: maxValueOfDay - minValueOfDay, "absoluteHours": maxValueOfDay });
                        minValueOfDay = null;
                        maxValueOfDay = 0;
                    }

                    lastDateTime = element.timestamp;
                });*/
            }

            that.onDataChangedCallbacks.forEach((callback) => callback());
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
