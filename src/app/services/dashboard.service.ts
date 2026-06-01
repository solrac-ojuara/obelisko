import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Produto, StatsData } from '../models/produto';
import { NfeProduto } from '../models/nfe';
import { mockProdutos, mockStats } from '../models/mock-data';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private productsSubject = new BehaviorSubject<Produto[]>(mockProdutos);
  private statsSubject = new BehaviorSubject<StatsData>(mockStats);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public products$: Observable<Produto[]> = this.productsSubject.asObservable();
  public stats$: Observable<StatsData> = this.statsSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Retorna a lista de produtos
   */
  getProducts(): Observable<Produto[]> {
    return this.products$;
  }

  /**
   * Retorna as estatísticas do dashboard
   */
  getStats(): Observable<StatsData> {
    return this.stats$;
  }

  /**
   * Filtra produtos por termo de busca
   */
  searchProducts(term: string): Observable<Produto[]> {
    const filtered = mockProdutos.filter(
      (p) =>
        p.produto.toLowerCase().includes(term.toLowerCase()) ||
        p.sku.toLowerCase().includes(term.toLowerCase()) ||
        p.categoria.toLowerCase().includes(term.toLowerCase())
    );
    return new BehaviorSubject(filtered).asObservable();
  }

  addFromNfe(nfeProdutos: NfeProduto[]): void {
    const current = this.productsSubject.value;
    const nextId = current.length > 0 ? Math.max(...current.map((p) => p.id)) + 1 : 1;

    const novos: Produto[] = nfeProdutos.map((p, i) => ({
      id: nextId + i,
      sku: p.cProd,
      produto: p.xProd,
      categoria: 'Importado NF-e',
      quantidade: p.quantidade,
      valor: p.valorUnitario,
      status: p.quantidade > 5 ? 'Em estoque' : p.quantidade > 0 ? 'Baixo estoque' : 'Fora de estoque',
    }));

    this.productsSubject.next([...current, ...novos]);
  }

  /**
   * Retorna produtos ordenados
   */
  sortProducts(
    products: Produto[],
    sortBy: keyof Produto,
    sortOrder: 'asc' | 'desc'
  ): Produto[] {
    const sorted = [...products].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (typeof aVal === 'number') {
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      return 0;
    });

    return sorted;
  }
}
