import { Injectable, OnDestroy } from '@angular/core';
import { HeaterDataService } from '../HeaterData/heater-data.service';
import { Logger } from 'serilogger';
import { LoggerService } from '../Logger/logger.service';
import { ValueDescriptionHashTable } from '../../entities/ValueDescriptionHashTable';
import { HeaterDataType } from '../../entities/HeaterDataType';

export interface DataPoint {
    description: string;
    timestamp: Date; 
    value: number;
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
    data: Array<{timeStamp: Date, value: number}>;
}

@Injectable({
  providedIn: 'root'
})
export class CurrentDataService implements OnDestroy {
    // #region fields
    /**
     * Array mit Callbacks welche ausgeführt werden, wenn die Daten vom Service aktualisiert wurden
     */
    private onDataChangedCallbacks = new Array<() => void>();

    /**
     * Promise für die Wertbeschreibungen
     */
    private valueDescriptionHashTablePromise: Promise<ValueDescriptionHashTable>;

    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

    /**
     * Funktionen, welche aufgerufen werden, wenn der Service abgebaut wird
     */
    private destroyFunctions: Array<() => void>;
    // #endregion

    // #region ctor
    /**
     * Initilisiert den Service
     * 
     * @param websocketService Service für Websocketkommunikation
     * @param heaterDataService Service für Heizungsdaten
     * @param loggerService Service für Lognachrichten
     */
    public constructor(
         heaterDataService: HeaterDataService,
         loggerService: LoggerService)
    {
        this.dataHashTable = {};
        this.destroyFunctions = new Array<() => void>();
        this.logger = loggerService.Logger;
        
        this.receivedDataFromDate = new Date();
        this.receivedDataToDate = new Date();

        this.valueDescriptionHashTablePromise = new Promise<ValueDescriptionHashTable>((resolve, reject) => 
        {
            this.logger.verbose("CurrentDataService: Requesting the ValueDescriptionHashTable from API...");
            heaterDataService.GetValueDescriptions()
                            .subscribe((valueDescriptionHashTable) =>
                            {
                                this.logger.verbose("CurrentDataService: Received ValueDescriptionHashTable from API.");
                                resolve(valueDescriptionHashTable);
                            }, (error) => this.logger.fatal(error, "CurrentDataService: An error accoured while receiving the ValueDescriptionHashTable from the API."));
        });

        heaterDataService.GetLatests().subscribe((heaterDataHashtable) => 
        {
            this.dataHashTable = heaterDataHashtable;

            this.rawDataArray.length = 0;
            for (let key in heaterDataHashtable)
            {
                if (typeof heaterDataHashtable[key] !== "undefined")
                {
                    if (heaterDataHashtable[key] != null)
                    {
                        this.rawDataArray.push(heaterDataHashtable[key]);
                    }
                }
            }

            this.handleOnNewHeaterData(heaterDataHashtable);

        }, (error) => this.logger.error(new Error(error), "HeaterDataService: Fehler beim Ermitteln der aktuellen Heizungsdaten"));

        var unsubscribe = heaterDataService.AddCurrentHeaterDataListeninger((newData) => this.handleOnNewHeaterData(newData));
        
        this.destroyFunctions.push(unsubscribe);
    }
    // #endregion

    // #region ngOnDestroy
    /**
     * Wird von Angular aufgerufen, wenn der Service abgebaut wird
     */
    public ngOnDestroy() 
    {
        while(this.destroyFunctions.length > 0)
        {
            this.destroyFunctions[0]();
            this.destroyFunctions.splice(0, 1);
        }

        this.destroyFunctions.length = 0;
    }
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
    public currentState: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region currentExhaustTemperature
    /**
     * Die aktuelle Temperatur vom Abgas
     */
    public currentExhaustTemperature: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region currentBufferTopTemperature
    /**
     * Die aktuelle Temperatur im Puffer oben
     */
    public currentBufferTopTemperature: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region currentBufferBottomTemperature
    /**
     * Die aktuelle Temperatur im Puffer unten
     */
    public currentBufferBottomTemperature: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region currentOutsideTemperature
    /**
     * Die aktuelle Außentemperatur
     */
    public currentOutsideTemperature: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region totalRunTimeHour
    /**
     * Die insgesamte Anzahl an Betriebsstunden
     */
    public totalRunTimeHour: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region doorOpenTimeSiceFireOut
    /**
     * Die Anzahl der Sekunden, welche die Tür geöffnet wurde seit dem 'Feuer Aus'. Wird beim Anheizen zurückgesetzt
     */
    public doorOpenTimeSiceFireOut: DataPoint = { description: "", timestamp: new Date(), unit: "", value: 0 };
    // #endregion

    // #region totalRunTimeByDay
    /**
     * Die Betriebsstunden pro Tag
     */
    public totalRunTimeByDay: Array<number> = new Array<number>();
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

    // #region handleOnNewHeaterData
    /**
     * Handled die neue Heizungsdaten, welche vom Server empfangen wurden
     * 
     * @param newHeaterDataHashMap Die neuen Heizungsdaten
     */
    private handleOnNewHeaterData(newHeaterDataHashMap:  HeaterDataHashMap): void 
    {
        this.valueDescriptionHashTablePromise.then((valueDescriptionHashTable) => 
        {
            for(let valueTypeId in newHeaterDataHashMap) 
            {
                if (typeof newHeaterDataHashMap[valueTypeId] == "object")
                {
                    if (newHeaterDataHashMap[valueTypeId] != null)
                    {
                        let dataValue = newHeaterDataHashMap[valueTypeId];

                        let timestamp = new Date(dataValue.data[0].timeStamp);
                        switch(valueTypeId) 
                        {
                            case HeaterDataType.Heizstatus.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Heizstatus, dataValue.data[0].value, timestamp, this.currentState);
                                break;

                            case HeaterDataType.Abgastemperatur.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Abgastemperatur, dataValue.data[0].value, timestamp, this.currentExhaustTemperature);
                                break;

                            case HeaterDataType.Puffer_oben.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Puffer_oben, dataValue.data[0].value, timestamp, this.currentBufferTopTemperature);
                                break;

                            case HeaterDataType.Puffer_unten.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Puffer_unten, dataValue.data[0].value, timestamp, this.currentBufferBottomTemperature);
                                break;

                            case HeaterDataType.Aussentemperatur.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Aussentemperatur, dataValue.data[0].value, timestamp, this.currentOutsideTemperature);
                                break;

                            case HeaterDataType.Betriebsstunden.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.Betriebsstunden, dataValue.data[0].value, timestamp, this.totalRunTimeHour);
                                break;

                            case HeaterDataType.TuerOffenSeitFuerAus.toString():
                                this.fillCurrentValue(valueDescriptionHashTable, HeaterDataType.TuerOffenSeitFuerAus, dataValue.data[0].value, timestamp, this.doorOpenTimeSiceFireOut);
                                break;
                        }
                    }
                }
            }
        });
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

            let dataWithGaps = Array<any>();
            let lastDate: Date;

            heaterType.data.forEach((dataPoint: any) => {
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
    private fillCurrentValue(valueDescriptionHashTable: ValueDescriptionHashTable, dataType: number, newValue: any, timestamp: string | Date, outputVariable: any): void {
        if (typeof valueDescriptionHashTable[dataType] === "object") {
            let valueDescription = valueDescriptionHashTable[dataType];

            outputVariable.description = valueDescription.description;
            outputVariable.timestamp = timestamp;
            outputVariable.unit = valueDescription.unit;
            outputVariable.value = newValue;
        }
    }
    // #endregion
}
