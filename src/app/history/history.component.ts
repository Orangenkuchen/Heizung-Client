import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Logger } from 'serilogger';
import { HeaterDataType } from '../entities/HeaterDataType';
import { CurrentDataService, HeaterDataHashMap } from '../services/CurrentDataService/current-data.service';
import { HeaterDataService } from '../services/HeaterData/heater-data.service';
import { LoggerService } from '../services/Logger/logger.service';

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
    styleUrls: ['./history.component.less'],
    encapsulation: ViewEncapsulation.None
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

    /**
     * Service für Heizungsdaten
     */
    private readonly heaterDataService: HeaterDataService;

    /**
     * Das Datum, welches zum Anzeigen der KW verwendet wird
     */
    private currentMoment: moment.Moment;

    /**
     * Service für Lognachrichten
     */
     private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param loggerService Service für Lognachrichten
     * @param heaterDataService Service für Heizungsdaten
     */
    public constructor(loggerService: LoggerService, heaterDataService: HeaterDataService) 
    {
        this.logger = loggerService.Logger;
        this.heaterDataService = heaterDataService;

        this.logger.debug("History-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void 
    {
        Highcharts.setOptions({
            time: {
                timezone: 'Europe/Berlin'
            }
        });

        this.chartContainerElement = document.getElementById("container").parentElement as HTMLDivElement;
        this.historyHighChart = Highcharts.chart('container', this.options);

        this.currentMoment = moment();
        this.changeDisplayedWeek(0);

        this.logger.debug("History-Component initialisiert (Angular ngOnInit)");
    }
    // #endregion

    // #region ngOnDestroy
    /**
     * Diese Funtion wird von Angular beim Abbauen der Componente ausgeführt
     */
    public ngOnDestroy(): void {
        this.unsubscribeArray.forEach((unsubscribe) => unsubscribe());

        this.logger.debug("History-Component abgebaut (Destructor)");
    }
    // #endregion

    // #region isFullscreenActive
    /**
     * Gibt an, ob Vollbild aktiv ist
     */
    public isFullscreenActive: boolean = false;
    // #endregion

    // #region currentWeekNumber
    /**
     * Die aktuell ausgewählte KW
     */
    public currentWeekNumber: Number;
    // #endregion

    // #region isIOSFullScreen
    /**
     * Workaround für den Fall, das Safari Mobil verwendet wird
     */
    public isIOSFullScreen: boolean = false;
    // #endregion

    // #region options
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

    // #region changeDisplayedWeek
    /**
     * Ändert die angezeigte Woche
     * @param weekToAdd Die Anzahl an Wochen, welche addiert werden sollen
     */
    public changeDisplayedWeek(weekToAdd: number): void
    {
        this.currentMoment = this.currentMoment.add(weekToAdd, "week");

        this.currentWeekNumber = this.currentMoment.isoWeek();

        this.historyHighChart.showLoading("Lädt...");
        this.heaterDataService.Get(
            this.currentMoment.startOf("isoWeek").toDate(), 
            this.currentMoment.endOf("isoWeek").toDate())
            .subscribe((heaterDataHashMap) =>
            {
                this.refreshHighchartData(heaterDataHashMap);
                this.historyHighChart.hideLoading();
            }, (error) =>
            {
                this.logger.error(error, "Fehler beim ermitteln der Historiendaten");
            });
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
     * 
     * @param heaterDataHashMap Die Daten, welche angezeigt werden sollen
     */
    private refreshHighchartData(heaterDataHashMap: HeaterDataHashMap)
    {
        this.logger.info("History-Component: refreshHighchartData wurde aufgerufen");

        if (typeof heaterDataHashMap[HeaterDataType.Abgastemperatur] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(heaterDataHashMap[HeaterDataType.Abgastemperatur].data, 0, this.showedDaysCount);
        }
        if (typeof heaterDataHashMap[HeaterDataType.Puffer_oben] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(heaterDataHashMap[HeaterDataType.Puffer_oben].data, 1, this.showedDaysCount);
        }
        if (typeof heaterDataHashMap[HeaterDataType.Puffer_unten] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(heaterDataHashMap[HeaterDataType.Puffer_unten].data, 2, this.showedDaysCount);
        }
        if (typeof heaterDataHashMap[HeaterDataType.Aussentemperatur] != "undefined") {
            this.convertDataAndAddToHighchrtSeries(heaterDataHashMap[HeaterDataType.Aussentemperatur].data, 3, this.showedDaysCount);
        }
        if (typeof heaterDataHashMap[HeaterDataType.Heizstatus] != "undefined") {
            if (this.options.series.length > 0) {
                let exaustTemperatureSeries: Array<{ x: any, y: any, status?: number|string }> = this.options.series[0].data;

                for (let i in exaustTemperatureSeries) {
                    let exaustTemperatureDataPoint = exaustTemperatureSeries[i];

                    for (let j in heaterDataHashMap[HeaterDataType.Heizstatus].data) {
                        let statusDataPoint: {timeStamp: Date, value: number} = heaterDataHashMap[HeaterDataType.Heizstatus].data[j];

                        if (exaustTemperatureDataPoint.x - new Date(statusDataPoint.timeStamp).getTime() < 3 * 1000) {

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

        this.historyHighChart.update(this.options);

        this.logger.debug("History-Component: refreshHighchartData ist abgeschlossen");
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
    private convertDataAndAddToHighchrtSeries(dataArray: Array<any>, seriesIndex: number, dayCount: number): void {
        if (this.options.series.length > seriesIndex - 1) {
            let series = this.options.series[seriesIndex];
            series.data.length = 0;

            dataArray.forEach((dataPoint) => 
            {
                let dataPointDate = new Date(dataPoint.timeStamp);

                let highChartPoint: any = {
                    x: dataPointDate.getTime(),
                    y: dataPoint.value
                };

                series.data.push(highChartPoint);
            });
        }
    }
    // #endregion

    // #region showFullScreen
    /**
     * Welchselt auf den Vollbild um
     */
    public showFullScreen(): void {
        this.logger.info("History-Component: showFullScreen wurde aufgerufen");

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
        this.logger.debug("History-Component: showFullScreen wurde abgeschlossen");
    }
    // #endregion

    // #region closeFullScreen
    /**
     * Schließt das Vollbild
     */
    public closeFullScreen(): void {
        this.logger.info("History-Component: closeFullScreen wurde aufgerufen");
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
        this.logger.debug("History-Component: closeFullScreen wurde beendet");
    }
    // #endregion
}
