import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';

const SERVER_URL = 'ws://***REMOVED***:8080';
//const SERVER_URL = 'ws://localhost:8080';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService{
    // #region webSocket
    /**
     * Die Websocketverbindung zum Server
     */
    public webSocket: Subject<MessageEvent>;
    // #endregion

    // #region ctor
    /**
     * Stellt die Verbindung mit dem Websocket her
     */
    public constructor()
    {
        let socket = new WebSocket(SERVER_URL);

        let observable = Observable.create(
            (observer: Observer<MessageEvent>) => {
                socket.onmessage = observer.next.bind(observer);
                socket.onerror = observer.error.bind(observer);
                socket.onclose = observer.complete.bind(observer);
                return socket.close.bind(socket);
            }
        );
        let observer = {
                next: (data: Object) => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify(data));
                    }
                }
        };
        this.webSocket = Subject.create(observer, observable);
    }
    // #endregion
}