import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { PageResponse } from '../../models/page-response.interface';
import { UserFilterParams } from '../../models/user-filter-params.interface';
import { UserSummary } from '../../models/user-summary.interface';
import { UserService } from '../../services/user.service';

interface InfiniteScrollTarget extends EventTarget {
  complete: () => Promise<void>;
  disabled: boolean;
}

@Component({
  selector: 'app-user-filter-list',
  standalone: true,
  templateUrl: './user-filter-list.html',
  styleUrl: './user-filter-list.css',
  imports: [ReactiveFormsModule],
})
export class UserFilterListComponent implements OnInit {
  private static readonly PAGE_SIZE = 10;

  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filterForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    lineageType: new FormControl('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true }),
    minAge: new FormControl<number | null>(null),
    maxAge: new FormControl<number | null>(null),
  });

  users: UserSummary[] = [];
  currentPage = 0;
  isLoading = true;
  isLastPage = false;
  totalElements = 0;

  private currentFilters: UserFilterParams = this.getCurrentFilters();

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        map(() => this.getCurrentFilters()),
        startWith(this.getCurrentFilters()),
        distinctUntilChanged((previous, current) =>
          JSON.stringify(previous) === JSON.stringify(current),
        ),
        tap(() => this.resetState()),
        switchMap((filters) => {
          this.currentFilters = filters;

          return this.userService.searchUsers(
            filters,
            0,
            UserFilterListComponent.PAGE_SIZE,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.replaceResults(page);
      });
  }

  onInfiniteScroll(event: Event): void {
    const infiniteScroll = event.target as InfiniteScrollTarget | null;

    if (!infiniteScroll || this.isLastPage || this.isLoading) {
      if (infiniteScroll) {
        infiniteScroll.disabled = this.isLastPage;
        void infiniteScroll.complete();
      }
      return;
    }

    this.currentPage += 1;

    this.userService
      .searchUsers(
        this.currentFilters,
        this.currentPage,
        UserFilterListComponent.PAGE_SIZE,
      )
      .subscribe({
        next: (page) => {
          this.appendResults(page);
          infiniteScroll.disabled = page.last;
          void infiniteScroll.complete();
        },
        error: () => {
          this.currentPage = Math.max(this.currentPage - 1, 0);
          void infiniteScroll.complete();
        },
      });
  }

  private getCurrentFilters(): UserFilterParams {
    const rawValue = this.filterForm.getRawValue();

    return {
      name: rawValue.name.trim(),
      lineageType: rawValue.lineageType.trim(),
      location: rawValue.location.trim(),
      minAge: this.normalizeAge(rawValue.minAge),
      maxAge: this.normalizeAge(rawValue.maxAge),
    };
  }

  private normalizeAge(value: number | null): number | null {
    if (value === null || Number.isNaN(value)) {
      return null;
    }

    return value;
  }

  private resetState(): void {
    this.currentPage = 0;
    this.users = [];
    this.totalElements = 0;
    this.isLastPage = false;
    this.isLoading = true;
  }

  private replaceResults(page: PageResponse<UserSummary>): void {
    this.users = page.content;
    this.totalElements = page.totalElements;
    this.currentPage = page.number;
    this.isLastPage = page.last;
    this.isLoading = false;
  }

  private appendResults(page: PageResponse<UserSummary>): void {
    this.users = [...this.users, ...page.content];
    this.totalElements = page.totalElements;
    this.currentPage = page.number;
    this.isLastPage = page.last;
  }
}
