import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  constructor(private _http: HttpClient) { }

  getSvgFile(url: string): Observable<any> {
    let headers = new HttpHeaders({
      'Accept': 'image/svg+xml'
    });
    return this._http.get(url, { headers, observe: "response", responseType: 'text' });
  }

  get(url: string): Observable<any> {
    return this._http.get(url, { observe: "response" });
  }

  getWithParam(url: string, params: HttpParams): Observable<any> {
    return this._http.get(url, { params, observe: "response" });
  }

  post(url: string, body: any): Observable<any> {
    return this._http.post(url, body, { observe: "response" });
  }

  postWithParam(url: string, body: any, params: HttpParams): Observable<any> {
    return this._http.post(url, body, { observe: "response", params });
  }

  put(url: string, body: any): Observable<any> {
    return this._http.put(url, body, { observe: "response" });
  }

  delete(url: string): Observable<any> {
    return this._http.delete(url, { observe: "response" });
  }

  patch(url: string, body: string): Observable<any> {
    return this._http.patch(url, body);
  }

  putWithHeaders(url: string, body?: string, header?: any) {
    let headers = new HttpHeaders({
      'Authorization': header.token,
      'Content-Type': 'application/json'
    });
    return this._http.put(url, body, { headers: headers, observe: "response" });
  }

  putWithoutBody(url: string): Observable<any> {
    return this._http.put(url, { observe: "response" });
  }

  getWithHeaders(url: string, header?: any) {
    let headers = new HttpHeaders({
      'Authorization': header.token,
      'Content-Type': 'application/json'
    });
    return this._http.get(url, { headers: headers, observe: "response" });
  }
}
