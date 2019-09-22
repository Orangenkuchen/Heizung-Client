import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';

const SERVER_URL = 'ws://***REMOVED***:8080';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService{
  public createWebsocket(): Subject<MessageEvent> {
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
        return Subject.create(observer, observable);
  }
}