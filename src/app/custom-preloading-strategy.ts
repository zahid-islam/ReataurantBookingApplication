import { PreloadingStrategy, Route } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { flatMap } from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
    preload(route: Route, load: Function): Observable<any> {
        const loadRoute = (delay) => delay
            ? timer(3000).pipe(flatMap(_ => load()))
            : load();
        return route.data && route.data.preload
            ? loadRoute(route.data.delay)
            : of(null);
    }
}
