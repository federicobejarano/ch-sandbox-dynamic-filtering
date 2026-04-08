import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/registration-form/registration-form').then(
        (m) => m.RegistrationForm,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/user-list/user-list').then((m) => m.UserList),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/user-filter-list/user-filter-list').then(
        (m) => m.UserFilterListComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
