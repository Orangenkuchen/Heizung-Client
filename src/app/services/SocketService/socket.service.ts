import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs';

const SERVER_URL = 'wws://localhost:8080';

@Injectable({
    providedIn: 'root',
  })
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL, {
            transports: ['websocket', 'xhr-polling']
        });
    }

    public send(message: any): void {
        this.socket.emit('message', message);
    }

    public onMessage(): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on('message', (data: any) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}