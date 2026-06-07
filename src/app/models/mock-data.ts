import { Produto, StatsData } from './produto';

/**
 * Dados mock de produtos para testes
 */
export const mockProdutos: Produto[] = [
  {
    id: '1',
    sku: 'SKU001',
    produto: 'Notebook Dell Inspiron',
    categoria: 'Eletrônicos',
    quantidade: 15,
    valor: 3500.00,
    status: 'Em estoque',
  },
  {
    id: '2',
    sku: 'SKU002',
    produto: 'Mouse Logitech MX',
    categoria: 'Periféricos',
    quantidade: 45,
    valor: 250.00,
    status: 'Em estoque',
  },
  {
    id: '3',
    sku: 'SKU003',
    produto: 'Teclado Mecânico RGB',
    categoria: 'Periféricos',
    quantidade: 8,
    valor: 450.00,
    status: 'Baixo estoque',
  },
  {
    id: '4',
    sku: 'SKU004',
    produto: 'Monitor LG 27"',
    categoria: 'Monitores',
    quantidade: 0,
    valor: 1200.00,
    status: 'Fora de estoque',
  },
  {
    id: '5',
    sku: 'SKU005',
    produto: 'Webcam Logitech 4K',
    categoria: 'Periféricos',
    quantidade: 22,
    valor: 600.00,
    status: 'Em estoque',
  },
];

/**
 * Dados mock de estatísticas
 */
export const mockStats: StatsData = {
  totalProducts: 5,
  lowStockCount: 1,
  outOfStockCount: 1,
  totalValue: 67150.00,
};
