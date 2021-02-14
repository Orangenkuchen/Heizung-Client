import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/DataService/data.service';
import * as Highcharts from 'highcharts';
import * as Moment from 'moment-timezone';
import { HeaterDataType } from '../entities/HeaterDataType';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.less']
})
export class HistoryComponent implements OnInit, OnDestroy {

    // #region fields
    /**
     * Dieser Array enthält unsubscribe Funktionen
     */
    private unsubscribeArray = Array<() => void>();

    /**
     * Die Anzahl der Tage welche angezeigt werden soll
     */
    private showedDaysCount: number;

    /**
     * Der Contianer vom Diagramm
     */
    private chartContainerElement: HTMLDivElement;

    /**
     * Highchart welches die Historiendaten anzeigt
     */
    private historyHighChart: Highcharts.Chart;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * @param dataService Service welche die aktuellen Daten beinhaltet
     */
    constructor(private dataService: DataService) {
    };
    // #endregion

    // #region ngOnInit
    ngOnInit() {
        window["moment"] = Moment;

        let that = this;
        this.showedDaysCount = 1;
        this.refreshHighchartData(that);

        let unsubscribe = this.dataService.addOnDataChangeCallback(() => this.refreshHighchartData(that));
        this.unsubscribeArray.push(unsubscribe);

        Highcharts.setOptions({
            time: {
                timezone: 'Europe/Berlin'
            }
        });

        this.chartContainerElement = document.getElementById("container").parentElement as HTMLDivElement;
        
        this.historyHighChart = Highcharts.chart('container', this.options);
    }
    // #endregion

    // #region ngOnDestroy
    ngOnDestroy() {
        this.unsubscribeArray.forEach((unsubscribe) => unsubscribe());
    }
    // #endregion

    // #region isFullscreenActive
    /**
     * Gibt an, ob Vollbild aktiv ist
     */
    public isFullscreenActive: boolean = false;
    // #endregion

    // #region isIOSFullScreen
    /**
     * Workaround für den Fall, das Safari Mobil verwendet wird
     */
    public isIOSFullScreen: boolean = false;
    // #endregion

    // #region config
    /**
     * Die Konfiguration für das Highchart
     */
    public options: any = {
        chart: {
            type: 'line',
            //height: 375,
            //height: '100%',
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: 'Heizungswerte'
        },
        credits: {
            enabled: true
        },
        tooltip: {
            formatter: this.formatTooltip
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
    // #endregion

    // #region formatTooltip
    /**
     * Wird aufgerufen, wenn im Diagramm über einen Datenpunkt gefahren wird
     */
    private formatTooltip() {
        let that: any = this;

        let tooltip = `${Math.round(that.y.toFixed(2) * 10) / 10} °C ${Highcharts.dateFormat('%e %b %y %H:%M:%S', that.x)}`

        if (typeof that.point.status == "number" ||
            typeof that.point.status == "string") {
            tooltip += ` (${that.point.status})`;
        }

        return tooltip;
    }
    // #endregion

    // #region refreshHighchartData
    /**
     * Aktualisiert die Daten für die angezeigten Highchart-Axen
     */
    private refreshHighchartData(that: any) {
        if (typeof that.dataService.dataHashTable[HeaterDataType.Abgastemperatur] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(that, that.dataService.dataHashTable[HeaterDataType.Abgastemperatur].data, 0, that.showedDaysCount);
        }
        if (typeof that.dataService.dataHashTable[HeaterDataType.Puffer_oben] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(that, that.dataService.dataHashTable[HeaterDataType.Puffer_oben].data, 1, that.showedDaysCount);
        }
        if (typeof that.dataService.dataHashTable[HeaterDataType.Puffer_unten] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(that, that.dataService.dataHashTable[HeaterDataType.Puffer_unten].data, 2, that.showedDaysCount);
        }
        if (typeof that.dataService.dataHashTable[HeaterDataType.Aussentemperatur] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(that, that.dataService.dataHashTable[HeaterDataType.Aussentemperatur].data, 3, that.showedDaysCount);
        }
        if (typeof that.dataService.dataHashTable[HeaterDataType.Heizstatus] != "undefined") {
            if (that.options.series.length > 0) {
                let exaustTemperatureSeries: Array<{ x: any, y: any, status?: number|string }> = that.options.series[0].data;

                for (let i in exaustTemperatureSeries) {
                    let exaustTemperatureDataPoint = exaustTemperatureSeries[i];

                    for (let j in that.dataService.dataHashTable[HeaterDataType.Heizstatus].data) {
                        let statusDataPoint: {timestamp: Date, value: number} = that.dataService.dataHashTable[HeaterDataType.Heizstatus].data[j];

                        if (exaustTemperatureDataPoint.x - statusDataPoint.timestamp.getTime() < 3 * 1000) {

                            switch(statusDataPoint.value) {
                                case 2:
                                    exaustTemperatureDataPoint.status = "Anheizen";
                                    break;
                                case 3:
                                    exaustTemperatureDataPoint.status = "Heizen";
                                    break;
                                case 4:
                                    exaustTemperatureDataPoint.status = "Feuererhaltung";
                                    break;
                                case 5:
                                    exaustTemperatureDataPoint.status = "Feuer Aus";
                                    break;
                                case 9:
                                    exaustTemperatureDataPoint.status = "Zünden";
                                    break;
                                case 35:
                                    exaustTemperatureDataPoint.status = "Zünden warten";
                                    break;
                                case 56:
                                    exaustTemperatureDataPoint.status = "Vorbelüften";
                                    break;
                                default:
                                    exaustTemperatureDataPoint.status = statusDataPoint.value;
                                    break;
                            }

                            break;
                        }
                    }
                }
            }
        }

        Highcharts.chart('container', that.options);
    }
    // #endregion

    // #region convertDataAndAddToHighchrtSeries
    /**
     * Wandelt die rohen Daten um und fügt sie in die Highchart-Serie ein
     * 
     * @param that Das This vom Parent
     * @param dataArray Der Array mit den Daten
     * @param seriesIndex Der Index von der Datenserie, in welche die Daten eingefügt werden sollen
     * @param dayCount Die Anzahl an Tagen, welche Rückwirkend in das Diagramm eingefügt werden soll
     */
    private convertDataAndAddToHighchrtSeries(that: any, dataArray: Array<any>, seriesIndex: number, dayCount: number): void {
        if (that.options.series.length > seriesIndex - 1) {
            let series = that.options.series[seriesIndex];
            series.data.length = 0;

            dataArray.forEach((dataPoint) => {
                // @ts-ignore
                if (new Date() - dataPoint.timestamp < dayCount * 1000 * 60 * 60 * 24) {
                    let highChartPoint = {
                        x: dataPoint.timestamp.getTime(),
                        y: dataPoint.value
                    };

                    series.data.push(highChartPoint);
                }
            });
        }
    }
    // #endregion

    // #region changeShownDaysAndRefresh
    /**
     * Ändert die Tage welche im Highchart angezeigt werden
     * 
     * @param dayCount Die Anzahl der Tage welche angezeigt werden
     */
    public changeShownDaysAndRefresh(dayCount: number): void {
        this.showedDaysCount = dayCount;
        let that = this;

        this.refreshHighchartData(that);
    }
    // #endregion

    // #region showFullScreen
    /**
     * Welchselt auf den Vollbild um
     */
    public showFullScreen(): void {
        if (this.chartContainerElement.requestFullscreen) {
            this.chartContainerElement.requestFullscreen();
        // @ts-ignore
        } else if (this.chartContainerElement.mozRequestFullScreen) { /* Firefox */
            // @ts-ignore
            this.chartContainerElement.mozRequestFullScreen();
        // @ts-ignore
        } else if (this.chartContainerElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            // @ts-ignore
            this.chartContainerElement.webkitRequestFullscreen();
        // @ts-ignore
        } else if (this.chartContainerElement.msRequestFullscreen) { /* IE/Edge */
            // @ts-ignore
            this.chartContainerElement.msRequestFullscreen();
        } else {
            this.isIOSFullScreen = true;

            setTimeout(() => {
                this.historyHighChart = Highcharts.chart('container', this.options);
            }, 0);
        }

        this.isFullscreenActive = true;
    }
    // #endregion

    // #region closeFullScreen
    /**
     * Schließt das Vollbild
     */
    public closeFullScreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        // @ts-ignore
        } else if (document.mozCancelFullScreen) { /* Firefox */
            // @ts-ignore
            document.mozCancelFullScreen();
        // @ts-ignore
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            // @ts-ignore
            document.webkitExitFullscreen();
        // @ts-ignore
        } else if (document.msExitFullscreen) { /* IE/Edge */
            // @ts-ignore
            document.msExitFullscreen();
        } else {
            this.isIOSFullScreen = false;

            setTimeout(() => {
                this.historyHighChart = Highcharts.chart('container', this.options);
            }, 0);
        }

        this.isFullscreenActive = false;
    }
    // #endregion
}
