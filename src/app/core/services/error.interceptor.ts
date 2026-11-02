import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { DialogService } from './dialog';
import { AuthorizationRepository } from '../../domain/authorization';
import { Router } from '@angular/router';
import { AppService } from './app';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialogService = inject(DialogService);
  const authorizationRepository = inject(AuthorizationRepository);
  const router = inject(Router);
  const appService = inject(AppService)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        dialogService.openDialog('Server is down. Contact System Administrator', 'error');
        appService.isLoading.set(null);
        return throwError(() => error);
      }

      if (error.status === 403 || (error.status === 401 && localStorage.getItem('Token'))) {
        dialogService.openDialog(
          'Your session has expired or is no longer valid.\nPlease log in again.',
          'error',
        );

        authorizationRepository.logout();
        router.navigate(['/login']);
        appService.isLoading.set(null);
        return throwError(() => error);
      }

      if (error.error) {
        console.log(error.error)

        if (error.error instanceof Blob) {
          return from(error.error.text()).pipe(
            switchMap(text => {
              const message = text.replace(/^"|"$/g, '');
              dialogService.openDialog(message, 'error');
              appService.isLoading.set(null);
              return throwError(() => error);
            })
          );
        }

        // /^"|"$/g
        // It is a regular expression that matches a double quote at the start (^) or end ($) of the string.
        // The 'g' flag stands for 'global', meaning it will replace all occurrences that match the pattern.
        dialogService.openDialog(typeof error.error === 'string' ? error.error.replace(/^"|"$/g, '') : JSON.stringify(error.error), 'error');
        appService.isLoading.set(null);
      }

      return throwError(() => error);
    })
  );
};
