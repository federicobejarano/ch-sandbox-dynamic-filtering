import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../models/page-response.interface';
import { UserFilterParams } from '../models/user-filter-params.interface';
import { UserRegistrationRequest } from '../models/user-registration.interface';
import { UserRegistrationResponse } from '../models/user-registration-response.interface';
import { UserSummary } from '../models/user-summary.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;

  // Learning Note: HttpClient devuelve Observables "cold";
  // la llamada real ocurre cuando un consumidor se suscribe.
  register(
    request: UserRegistrationRequest,
  ): Observable<UserRegistrationResponse> {
    return this.httpClient.post<UserRegistrationResponse>(this.usersUrl, request);
  }

  getAll(): Observable<UserRegistrationResponse[]> {
    return this.httpClient.get<UserRegistrationResponse[]>(this.usersUrl);
  }

  searchUsers(
    filters: UserFilterParams,
    page: number,
    size: number,
  ): Observable<PageResponse<UserSummary>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (filters.name.trim()) {
      params = params.set('name', filters.name.trim());
    }

    if (filters.location.trim()) {
      params = params.set('location', filters.location.trim());
    }

    if (filters.lineageType.trim()) {
      params = params.set('lineageType', filters.lineageType.trim());
    }

    if (filters.minAge !== null) {
      params = params.set('minAge', filters.minAge);
    }

    if (filters.maxAge !== null) {
      params = params.set('maxAge', filters.maxAge);
    }

    return this.httpClient.get<PageResponse<UserSummary>>(this.usersUrl, {
      params,
    });
  }
}
