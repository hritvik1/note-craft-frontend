import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, empty, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class WebRequestInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if(error.status === 401 && request.url.endsWith('/users/me/access-token')) {
          console.log("Refresh Token has expired");

          this.authService.removeStorageItems();
          this.router.navigateByUrl("/login");

          return empty();
        }

        if(error.status === 401) {
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log("Catching Error");
              console.log(err);

              this.authService.removeStorageItems();
              this.router.navigateByUrl('/login');

              return empty();
            })
          )
        }

        return throwError(error);
      })
    )
  }

  refreshAccessToken() {
    return this.authService.getNewAccessToken().pipe(
      tap(() => {
        console.log("Access Token Refreshed")
      })
    )
  }

  addAuthHeader(request: HttpRequest<any>) {
    const token = this.authService.getAccessToken();

    if(token) {
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }

    return request;
  }
}
