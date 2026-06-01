import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsData } from '../../../models/produto';

interface StatCard {
  label: string;
  value: string | number;
  color: string;
  textColor: string;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss'],
})
export class StatsCardsComponent {
  @Input() data!: StatsData;
  @Input() isLoading: boolean = false;

  get cards(): StatCard[] {
    if (!this.data) return [];

    return [
      {
        label: 'Total de Produtos',
        value: this.data.totalProducts,
        color: '#005A8D',
        textColor: '#001F3F',
      },
      {
        label: 'Baixo Estoque',
        value: this.data.lowStockCount,
        color: '#E5C200',
        textColor: '#CCB000',
      },
      {
        label: 'Fora de Estoque',
        value: this.data.outOfStockCount,
        color: '#EF4444',
        textColor: '#DC2626',
      },
      {
        label: 'Valor Total',
        value: `R$ ${(this.data.totalValue / 1000).toFixed(1)}K`,
        color: '#10B981',
        textColor: '#059669',
      },
    ];
  }
}
