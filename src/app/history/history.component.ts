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
    // #endregion

    constructor(private dataService: DataService) { }

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

        Highcharts.chart('container', this.options);
    }

    ngOnDestroy() {
        this.unsubscribeArray.forEach((unsubscribe) => unsubscribe());
    }

    // #region config
    /**
     * Die Konfiguration für das Highchart
     */
    public options: any = {
        chart: {
          type: 'line',
          height: 700,
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
            let zones = new Array<{ value: number, color: string}>();
            let lastColor: string;
            let lastDateValue: number;

            that.dataService.dataHashTable[HeaterDataType.Heizstatus].data.forEach((data) => {
                let color: string;

                switch(data.value) {
                    case 5:
                        // Feuer aus
                        color = "#0088cc";
                        break;
                    case 4:
                        // Feuererhaltung
                        color = "#FF0000";
                        break;
                    case 3:
                        // Feuer an
                        color = "#fa9200";
                        break;
                    case 6:
                        // Tür auf
                        color = "#FF00FF";
                        break;
                    case 2:
                        // Anheizen
                        color = "#00fa9a";
                        break;
                }

                if (color != lastColor) {
                    if (typeof lastColor == "string" && typeof lastDateValue == "number") {
                      zones.push({
                          value: lastDateValue,
                          color: lastColor
                      });
                    }

                    zones.push({
                        value: data.timestamp.getTime(),
                        color: color
                    });
                    data.timestamp.getTime();
                }

                lastColor = color;
                lastDateValue = data.timestamp.getTime();
            });

            that.options.series[0].zoneAxis = "x";
            that.options.series[0].zones = zones;
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
                    let highChartPoint = [];

                    highChartPoint.push(dataPoint.timestamp.getTime());
                    highChartPoint.push(dataPoint.value);

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
}
