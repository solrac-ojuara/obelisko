/**
 * Modelo de Produto
 */
export interface Produto {
  id: string;
  usuario_id?: string;
  sku: string;
  produto: string;
  categoria: string;
  quantidade: number;
  valor: number;
  valor_atual?: number;
  status: 'Em estoque' | 'Baixo estoque' | 'Fora de estoque';
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Dados de estatísticas do dashboard
 */
export interface StatsData {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface AppUser {
  id: string;
  email: string;
  nome?: string;
  role?: string;
  cnpj?: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
}
