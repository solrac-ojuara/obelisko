import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationComponent } from '../../components/dashboard/navigation/navigation.component';
import { AddPurchaseModalComponent } from '../../components/dashboard/add-purchase-modal/add-purchase-modal.component';
import { DashboardHeaderComponent } from '../../components/dashboard/dashboard-header/dashboard-header.component';
import { StatsCardsComponent } from '../../components/dashboard/stats-cards/stats-cards.component';
import { SearchBarComponent } from '../../components/dashboard/search-bar/search-bar.component';
import { ProductTableComponent } from '../../components/dashboard/product-table/product-table.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Produto, StatsData, AppUser } from '../../models/produto';
import { NfeProduto } from '../../models/nfe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    DashboardHeaderComponent,
    StatsCardsComponent,
    SearchBarComponent,
    ProductTableComponent,
    AddPurchaseModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  products: Produto[] = [];
  filteredProducts: Produto[] = [];
  stats: StatsData = {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  };
  isLoading: boolean = false;
  searchTerm: string = '';
  sortBy: keyof Produto = 'criado_em' as keyof Produto;
  sortOrder: 'asc' | 'desc' = 'desc';
  isModalOpen: boolean = false;
  userCnpj: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  private dataLoaded = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authService.user$.subscribe((user: AppUser | null) => {
      this.userCnpj = user?.cnpj ?? '';
      if (user && !this.dataLoaded) {
        this.dataLoaded = true;
        this.loadData();
      } else if (user === null && this.dataLoaded) {
        this.router.navigate(['/login']);
      }
    });
  }

  loadData(): void {
    this.dashboardService.getProducts().subscribe((products) => {
      this.products = products;
      this.filteredProducts = products;
    });

    this.dashboardService.getStats().subscribe((stats) => {
      this.stats = stats;
    });

    this.dashboardService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });

    this.dashboardService.currentPage$.subscribe((page) => {
      this.currentPage = page;
    });

    this.dashboardService.totalPages$.subscribe((pages) => {
      this.totalPages = pages;
    });

    this.dashboardService.loadProducts();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.dashboardService.loadProducts(1, this.sortBy as string, this.sortOrder, term);
  }

  onSort(column: keyof Produto): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.dashboardService.loadProducts(this.currentPage, this.sortBy as string, this.sortOrder, this.searchTerm);
  }

  onPageChange(page: number): void {
    this.dashboardService.loadProducts(page, this.sortBy as string, this.sortOrder, this.searchTerm);
  }

  onAddPurchase(): void {
    this.isModalOpen = true;
  }

  async onImportarProdutos(produtos: NfeProduto[]): Promise<void> {
    await this.dashboardService.addFromNfe(produtos);
    this.isModalOpen = false;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
  }
}
