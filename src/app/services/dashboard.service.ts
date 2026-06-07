import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Produto, StatsData } from '../models/produto';
import { NfeProduto } from '../models/nfe';
import { SupabaseService } from './supabase-service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  readonly pageSize = 10;

  private productsSubject = new BehaviorSubject<Produto[]>([]);
  private statsSubject = new BehaviorSubject<StatsData>({ totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalValue: 0 });
  private totalCountSubject = new BehaviorSubject<number>(0);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  private currentSort = 'criado_em';
  private currentSortOrder: 'asc' | 'desc' = 'desc';
  private currentSearch = '';

  public products$: Observable<Produto[]> = this.productsSubject.asObservable();
  public stats$: Observable<StatsData> = this.statsSubject.asObservable();
  public totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  public currentPage$: Observable<number> = this.currentPageSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public totalPages$: Observable<number> = this.totalCountSubject.pipe(
    map((count) => Math.max(1, Math.ceil(count / this.pageSize)))
  );

  constructor(private supabaseService: SupabaseService) {}

  async loadProducts(
    page = 1,
    sortBy = this.currentSort,
    sortOrder: 'asc' | 'desc' = this.currentSortOrder,
    search = this.currentSearch
  ): Promise<void> {
    this.currentSort = sortBy;
    this.currentSortOrder = sortOrder;
    this.currentSearch = search;

    this.loadingSubject.next(true);
    const from = (page - 1) * this.pageSize;
    const to = from + this.pageSize - 1;

    try {
      let query = this.supabaseService
        .getClient()
        .from('produtos')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (search.trim()) {
        query = query.or(
          `produto.ilike.%${search}%,sku.ilike.%${search}%,categoria.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;
      this.productsSubject.next((data as Produto[]) ?? []);
      this.totalCountSubject.next(count ?? 0);
      this.currentPageSubject.next(page);
    } finally {
      this.loadingSubject.next(false);
    }

    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('produtos')
      .select('quantidade, valor, status');

    if (error || !data) return;

    this.statsSubject.next({
      totalProducts: data.length,
      lowStockCount: data.filter((p: any) => p.status === 'Baixo estoque').length,
      outOfStockCount: data.filter((p: any) => p.status === 'Fora de estoque').length,
      totalValue: data.reduce((sum: number, p: any) => sum + Number(p.valor) * Number(p.quantidade), 0),
    });
  }

  getProducts(): Observable<Produto[]> {
    return this.products$;
  }

  getStats(): Observable<StatsData> {
    return this.stats$;
  }

  async updateProduct(id: string, updates: { quantidade?: number; valor_atual?: number }): Promise<void> {
    const payload: Record<string, unknown> = { ...updates, atualizado_em: new Date().toISOString() };

    if (updates.quantidade !== undefined) {
      payload['status'] = updates.quantidade > 5 ? 'Em estoque' : updates.quantidade > 0 ? 'Baixo estoque' : 'Fora de estoque';
    }

    const { error } = await this.supabaseService.getClient()
      .from('produtos')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    await this.loadProducts(this.currentPageSubject.value, this.currentSort, this.currentSortOrder, this.currentSearch);
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await this.loadProducts(this.currentPageSubject.value, this.currentSort, this.currentSortOrder, this.currentSearch);
  }

  async addFromNfe(nfeProdutos: NfeProduto[]): Promise<void> {
    const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const novos = nfeProdutos.map((p) => ({
      usuario_id: user.id,
      sku: p.cProd,
      produto: p.xProd,
      categoria: 'Importado NF-e',
      quantidade: p.quantidade,
      valor: p.valorUnitario,
      status: p.quantidade > 5 ? 'Em estoque' : p.quantidade > 0 ? 'Baixo estoque' : 'Fora de estoque',
    }));

    const { error } = await this.supabaseService.getClient()
      .from('produtos')
      .upsert(novos, { onConflict: 'sku' });

    if (error) throw error;
    await this.loadProducts(this.currentPageSubject.value);
  }
}
