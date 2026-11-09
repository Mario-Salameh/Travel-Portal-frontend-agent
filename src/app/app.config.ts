import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApiConfiguration } from './data/api-configuration';
import { errorInterceptor } from './core/services/error.interceptor';
import { authInterceptor } from './core/services/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEchartsCore({ echarts }),

    // provideApiConfiguration("http://10.10.110.3:1229")

    // Local Testing
    provideApiConfiguration("http://localhost:5012")
    // provideApiConfiguration("http://10.10.11.97:5012")
  ]
};
