import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../../models/produto';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss'],
})
export class ProductTableComponent {
  @Input() products: Produto[] = [];
  @Input() sortBy: keyof Produto = 'produto';
  @Input() sortOrder: 'asc' | 'desc' = 'asc';
  @Input() isLoading: boolean = false;
  @Output() sort = new EventEmitter<keyof Produto>();

  onSort(column: keyof Produto): void {
    this.sort.emit(column);
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
    return this.products.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
  }
}
