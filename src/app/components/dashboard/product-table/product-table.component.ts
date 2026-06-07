import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Produto } from '../../../models/produto';
import { ProductSettingsButtonComponent } from '../product-settings-button/product-settings-button.component';
import { ProductStockRemoveButtonComponent } from '../product-stock-remove-button/product-stock-remove-button.component';
import { ProductSettingsDialogComponent } from '../product-settings-dialog/product-settings-dialog.component';
import { ProductStockRemoveDialogComponent } from '../product-stock-remove-dialog/product-stock-remove-dialog.component';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, ProductSettingsButtonComponent, ProductStockRemoveButtonComponent],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss'],
})
export class ProductTableComponent {
  @Input() products: Produto[] = [];
  @Input() sortBy: keyof Produto = 'produto';
  @Input() sortOrder: 'asc' | 'desc' = 'asc';
  @Input() isLoading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() sort = new EventEmitter<keyof Produto>();
  @Output() pageChange = new EventEmitter<number>();

  constructor(private dialog: MatDialog) {}

  openSettings(product: Produto): void {
    this.dialog.open(ProductSettingsDialogComponent, {
      data: product,
      width: '400px',
      panelClass: 'rounded-xl',
    });
  }

  openStockRemove(product: Produto): void {
    this.dialog.open(ProductStockRemoveDialogComponent, {
      data: product,
      width: '360px',
      panelClass: 'rounded-xl',
    });
  }

  onSort(column: keyof Produto): void {
    this.sort.emit(column);
  }

  onPrev(): void {
    if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1);
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) this.pageChange.emit(this.currentPage + 1);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Em estoque':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Baixo estoque':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Fora de estoque':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.valor_atual ?? p.valor) * p.quantidade, 0);
  }
}
