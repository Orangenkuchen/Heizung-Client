import { Injectable } from '@angular/core';
import { WebsocketService } from '../WebSocket/web-socket.service';
import { ServerToClientCommand } from 'src/app/entities/socket/serverToClient/ServerToClientCommand';
import { ServerToClientCommandType } from 'src/app/entities/socket/serverToClient/ServerToClientCommandType';

@Injectable({
    providedIn: 'root'
})

export interface MailConfig {
    mail: string;
}

export interface NotifierConfig {
    lowerThreshold: number;
    mailConfigs: Array<MailConfig>;
}

export class MailService {
    // #region websocketService
    /**
     * Websocket zum kommunizieren mit dem Server
     */
    private websocketService: WebsocketService;

    /**
     * Array mit den Handler für MailConfigs
     */
    private onMailConfigReceivedArray: Array<(config: NotifierConfig) => void>;

    /**
     * Array mit den Handlers für das Speichern der Konfig
     */
    private onMailConfigSavedArray: Array<() => void>;
    // #endregion

    // #region ctor
    /**
     * Service zum bearbeiten des Mailservice
     */
    public constructor(websocketService: WebsocketService) {
        this.websocketService = websocketService;

        websocketService.webSocket.subscribe((messageEvent: MessageEvent) => this.handleOnWebSocketMessage(this, messageEvent));
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

        if (serverToClientCommand.commandType == ServerToClientCommandType.NotifierConfigCommand) {
            for (let paramName in this.onMailConfigReceivedArray) {
                this.onMailConfigReceivedArray[paramName](serverToClientCommand.dataObject);
            }

            this.onMailConfigReceivedArray.length = 0;
        } else if (serverToClientCommand.commandType == ServerToClientCommandType.FeedbackCommand) {
            debugger;
            for (let paramName in this.onMailConfigSavedArray) {
                this.onMailConfigSavedArray[paramName]();
            }

            this.onMailConfigSavedArray.length = 0;
        }
    }
    // #endregion

    // #region requestMailConfig
    /**
     * Fragt beim Server die Konfiguration für den MailNotifier
     * 
     * @param handleOnConfigReceived Funktion welche ausgeführt werden soll, wenn die Konfiguation empfangen wurde
     */
    public requestMailConfig(handleOnConfigReceived: (config: NotifierConfig) => void) {
        let command: any = {
            commandType: 2,
            dataObject: null
        };

        this.onMailConfigReceivedArray.push(handleOnConfigReceived);

        this.websocketService.webSocket.next(command);
    }
    // #endregion

    // #region saveMailConfig
    /**
     * Speichert die Meldungskonfig ab
     * 
     * @param notifierConfig Die Konfiguration, welche gespeichert werden soll
     * @param hanldeOnConifgSaved Funktion, welche ausgeführt werden soll, wenn die Konfig gespeichert wurde
     */
    public saveMailConfig(notifierConfig: NotifierConfig, hanldeOnConifgSaved: () => void) {
        let command: any = {
            commandType: 3,
            dataObject: notifierConfig
        };

        this.onMailConfigSavedArray.push(hanldeOnConifgSaved);

        this.websocketService.webSocket.next(command);
    }
    // #endregion
}
