// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./presentation/pages/login/login')
            .then(m => m.Login)
    },
    {
        path: 'home',
        loadComponent: () => import('./presentation/pages/home/home')
            .then(m => m.Home)
    },
    {
        path: 'control-panel',
        loadComponent: () => import('./presentation/pages/control-panel/control-panel')
            .then(m => m.ControlPanel)

    }
];