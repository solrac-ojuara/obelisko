import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  sortBy: keyof Produto = 'produto';
  sortOrder: 'asc' | 'desc' = 'asc';
  isModalOpen: boolean = false;
  userCnpj: string = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.user$.subscribe((user: AppUser | null) => {
      this.userCnpj = user?.cnpj ?? '';
    });
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.dashboardService.getProducts().subscribe((products) => {
      this.products = products;
      this.filteredProducts = products;
      this.isLoading = false;
    });

    this.dashboardService.getStats().subscribe((stats) => {
      this.stats = stats;
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;

    if (term.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        (p: Produto) =>
          p.produto.toLowerCase().includes(term.toLowerCase()) ||
          p.sku.toLowerCase().includes(term.toLowerCase()) ||
          p.categoria.toLowerCase().includes(term.toLowerCase())
      );
    }
  }

  onSort(column: keyof Produto): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }

    this.filteredProducts = this.dashboardService.sortProducts(
      this.filteredProducts,
      this.sortBy,
      this.sortOrder
    );
  }

  onAddPurchase(): void {
    this.isModalOpen = true;
  }

  onImportarProdutos(produtos: NfeProduto[]): void {
    this.dashboardService.addFromNfe(produtos);
    this.isModalOpen = false;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
  }
}
