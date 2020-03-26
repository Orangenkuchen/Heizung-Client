import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValueDescription {
    Id: number;
    Description: string;
    IsLogged: boolean;
    Unit: string;
}

export interface ValueDescriptionHashTable {
    [valueId: number]: ValueDescription;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    private apiURL: string = "http://***REMOVED***:8080";

    constructor(private httpClient: HttpClient) { }

    public GetValueDescriptions(): Observable<ValueDescriptionHashTable>  {
        return this.httpClient.get<ValueDescriptionHashTable>(this.apiURL + "/ValueDescriptions");
    }
}
