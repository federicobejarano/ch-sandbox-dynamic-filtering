import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
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

type LineageBadgeColor = 'primary' | 'secondary' | 'tertiary' | 'medium';

@Component({
  selector: 'app-user-filter-list',
  standalone: true,
  templateUrl: './user-filter-list.html',
  styleUrl: './user-filter-list.css',
  imports: [
    ReactiveFormsModule,
    IonBackButton,
    IonBadge,
    IonButtons,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class UserFilterListComponent implements OnInit {
  private static readonly PAGE_SIZE = 10;

  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly lineageOptions = [
    { value: '', label: 'Todos' },
    { value: 'DESCENDANT', label: 'Descendiente' },
    { value: 'PHILHELLENE', label: 'Filoheleno' },
  ];

  readonly locationOptions = [
    { value: '', label: 'Todas' },
    { value: 'Resistencia', label: 'Resistencia' },
    { value: 'Corrientes', label: 'Corrientes' },
    { value: 'Buenos Aires', label: 'Buenos Aires' },
    { value: 'Atenas', label: 'Atenas' },
  ];

  readonly skeletonRows = [0, 1, 2, 3];

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
  isLoadingNextPage = false;
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

    if (!infiniteScroll || this.isLastPage || this.isLoading || this.isLoadingNextPage) {
      if (infiniteScroll) {
        infiniteScroll.disabled = this.isLastPage || this.isLoadingNextPage;
        void infiniteScroll.complete();
      }
      return;
    }

    this.isLoadingNextPage = true;
    this.currentPage += 1;

    this.userService
      .searchUsers(
        this.currentFilters,
        this.currentPage,
        UserFilterListComponent.PAGE_SIZE,
      )
      .pipe(
        finalize(() => {
          this.isLoadingNextPage = false;
          void infiniteScroll.complete();
        }),
      )
      .subscribe({
        next: (page) => {
          this.appendResults(page);
          infiniteScroll.disabled = page.last;
        },
        error: () => {
          this.currentPage = Math.max(this.currentPage - 1, 0);
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

  getLineageLabel(lineageType: string): string {
    return this.lineageOptions.find((option) => option.value === lineageType)?.label
      ?? lineageType;
  }

  getLineageColor(lineageType: string): LineageBadgeColor {
    if (lineageType === 'DESCENDANT') {
      return 'primary';
    }

    if (lineageType === 'PHILHELLENE') {
      return 'tertiary';
    }

    return 'medium';
  }

  getAgeLabel(birthDate: string): string {
    const birth = new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
      return 'Edad desconocida';
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const currentMonth = today.getMonth();
    const birthMonth = birth.getMonth();

    if (
      currentMonth < birthMonth
      || (currentMonth === birthMonth && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }

    return `${age} años`;
  }

  private normalizeAge(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const normalizedValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(normalizedValue)) {
      return null;
    }

    return normalizedValue;
  }

  private resetState(): void {
    this.currentPage = 0;
    this.users = [];
    this.totalElements = 0;
    this.isLastPage = false;
    this.isLoading = true;
    this.isLoadingNextPage = false;
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
