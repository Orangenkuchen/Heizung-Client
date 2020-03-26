import { Injectable } from '@angular/core';
import { WebsocketService } from '../WebSocket/web-socket.service';
import { ServerToClientCommandType } from 'src/app/entities/socket/serverToClient/ServerToClientCommandType';
import { HeaterDataType } from 'src/app/entities/HeaterDataType';
import * as Enumerable from 'linq';
import * as Moment from 'moment-timezone';
import { ClientToServerCommandType } from 'src/app/entities/socket/clientToServer/ClientToServerCommandType';
import { ApiService, ValueDescriptionHashTable } from '../ApiService/api.service';

export interface DataPoint {
    description: string;
    timestamp: Date; 
    value: Number;
    unit: string;
}


export interface HeaterDataHashMap {
    [id: number]: HeaterData;
}

export interface HeaterData {
    /**
     * Die Id vom Heizwerttyp
     */
    valueTypeId: number;
    
    /**
     * Die Beschreibung vom Heizwert
     */
    description: string;

    /**
     * Gibt an ob der Heizwert gelogged wird
     */
    isLogged: Boolean;

    /**
     * Die Einheit des Werts
     */
    unit: String;

    /**
     * Die Daten für den Heizwert
     */
    data: Array<{timestamp: Date, value: number}>;
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

    /**
     * Promise für die Wertbeschreibungen
     */
    private valueDescriptionHashTablePromise: Promise<ValueDescriptionHashTable>;
    // #endregion

    // #region rawDataHashTable
    /**
     * Hashtable mit den Rohdaten aus der Heizung
     */
    public rawDataHashTable: any = {};
    // #endregion

    // #region rawDataArray
    /**
     * Array mit den Rohdaten aus der Heizung
     */
    public rawDataArray: Array<any> = new Array<any>();
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
    public dataHashTable: HeaterDataHashMap;

    /**
     * Das Datum von den Erhalten Daten (min)
     */
    public receivedDataFromDate: Date;

    /**
     * Das Datum von den Erhalten Daten (max)
     */
    public receivedDataToDate: Date;
    // #endregion

    // #region ctor
    /**
     * Initilisiert den Service
     * 
     * @param websocketService Service für Websocketkommunikation
     */
    public constructor(websocketService: WebsocketService, apiService: ApiService) {
        this.dataHashTable = {};
        this.websocketService = websocketService;

        websocketService.webSocket.subscribe((messageEvent: MessageEvent) => this.handleOnWebSocketMessage(this, messageEvent));

        setTimeout(() => {
            this.requestCurrentData();
        }, 1000);

        setTimeout(() => {
            this.reqeustData(30);
        }, 3000);

        this.valueDescriptionHashTablePromise = new Promise<ValueDescriptionHashTable>((resolve, reject) => {
            apiService.GetValueDescriptions().subscribe((valueDescriptionHashTable) => {
                resolve(valueDescriptionHashTable);
            });
        });
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
            that.convertRevicedData(serverToClientCommand.dataObject.heaterDataHashMap);
    
            that.receivedDataFromDate = serverToClientCommand.dataObject.fromDate;
            that.receivedDataToDate = serverToClientCommand.dataObject.toDate;
            that.dataHashTable = serverToClientCommand.dataObject.heaterDataHashMap;

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
        } else if (serverToClientCommand.commandType == ServerToClientCommandType.NewestDataCommand) {
            for(let paramName in serverToClientCommand.dataObject) {
                if (typeof that.rawDataHashTable[paramName] == "undefined") {
                    that.rawDataHashTable[paramName] = serverToClientCommand.dataObject[paramName];
                    that.rawDataArray.push(serverToClientCommand.dataObject[paramName])
                } else {
                    let arrayIndex = that.rawDataArray.indexOf(that.rawDataHashTable[paramName]);

                    that.rawDataHashTable[paramName] = serverToClientCommand.dataObject[paramName];
                    that.rawDataArray[arrayIndex] = serverToClientCommand.dataObject[paramName];
                }
            }

            that.valueDescriptionHashTablePromise.then((valueDescriptionHashTable) => {
                for(let valueTypeId in serverToClientCommand.dataObject) {
                    let dataValue = serverToClientCommand.dataObject[valueTypeId];

                    let timestamp = new Date(dataValue.data[0].timestamp);
                    switch(valueTypeId) {
                        case HeaterDataType.Heizstatus.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Heizstatus, dataValue.data[0].value, timestamp, that.currentState);
                            break;

                        case HeaterDataType.Abgastemperatur.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Abgastemperatur, dataValue.data[0].value, timestamp, that.currentExhaustTemperature);
                            break;

                        case HeaterDataType.Puffer_oben.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Puffer_oben, dataValue.data[0].value, timestamp, that.currentBufferTopTemperature);
                            break;

                        case HeaterDataType.Puffer_unten.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Puffer_unten, dataValue.data[0].value, timestamp, that.currentBufferBottomTemperature);
                            break;

                        case HeaterDataType.Aussentemperatur.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Aussentemperatur, dataValue.data[0].value, timestamp, that.currentOutsideTemperature);
                            break;

                        case HeaterDataType.Betriebsstunden.toString():
                            that.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Betriebsstunden, dataValue.data[0].value, timestamp, that.totalRunTimeHour);
                            break;
                    }
                }
            });
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
    private fillCurrentValue(valueDescriptionHashTable: ValueDescriptionHashTable, dataType: HeaterDataType, newValue: any, timestamp: string | Date, outputVariable): void {
        if (typeof valueDescriptionHashTable[dataType] === "object") {
            let valueDescription = valueDescriptionHashTable[dataType];

            outputVariable.description = valueDescription.Description;
            outputVariable.timestamp = timestamp;
            outputVariable.unit = valueDescription.Unit;
            outputVariable.value = newValue;
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
            commandType: ClientToServerCommandType.RequestAllDataCommand,
            dataObject: {
                fromDate: formDate,
                toDate: toDate
            }
        };

        this.websocketService.webSocket.next(command);
    }
    // #endregion

    // #region requestCurrentData
    /**
     * Fragt die aktuellen Daten beim Server an
     */
    public requestCurrentData() {

        let command: any = {
            commandType: ClientToServerCommandType.RequestNewestDataCommand
        };

        this.websocketService.webSocket.next(command);
    }
    // #endregion
}
