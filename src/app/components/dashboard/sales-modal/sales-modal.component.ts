import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../../services/dashboard.service';
import { Produto } from '../../../models/produto';

interface SaleItem {
  produto: Produto;
  quantidade: number;
}

type Stage = 'cart' | 'payment' | 'result';

interface NfceResult {
  numero: number;
  serie: number;
  status: string;
  danfe_url?: string;
}

@Component({
  selector: 'app-sales-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './sales-modal.component.html',
  styleUrls: ['./sales-modal.component.scss'],
})
export class SalesModalComponent implements AfterViewInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  stage: Stage = 'cart';

  barcodeValue = '';
  isSearching = false;
  lastError = '';
  cart: SaleItem[] = [];

  formaPagamento: 'dinheiro' | 'credito' | 'debito' | 'pix' = 'dinheiro';
  cpfComprador = '';
  isProcessing = false;
  processError = '';

  nfceResult: NfceResult | null = null;

  readonly formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: 'payments' },
    { value: 'debito',   label: 'Débito',   icon: 'credit_card' },
    { value: 'credito',  label: 'Crédito',  icon: 'credit_card' },
    { value: 'pix',      label: 'Pix',      icon: 'pix' },
  ] as const;

  get total(): number {
    return this.cart.reduce(
      (sum, item) => sum + this.getPreco(item.produto) * item.quantidade, 0
    );
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantidade, 0);
  }

  get itensSemNcm(): SaleItem[] {
    return this.cart.filter(item => !item.produto.ncm || item.produto.ncm.replace(/\D/g, '').length !== 8);
  }

  constructor(
    private dialogRef: MatDialogRef<SalesModalComponent>,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.barcodeInput?.nativeElement.focus(), 150);
  }

  async onBarcodeEnter(): Promise<void> {
    const gtin = this.barcodeValue.trim();
    if (!gtin || this.isSearching) return;

    this.barcodeValue = '';
    this.lastError = '';
    this.isSearching = true;

    try {
      let produto: Produto | null = null;

      produto = await this.dashboardService.searchProductBySku(gtin);

      if (!produto) {
        const xProd = await this.dashboardService.consultarGtin(gtin);
        if (xProd) {
          produto = await this.dashboardService.searchProductByName(xProd);
        }
      }

      if (!produto) {
        this.lastError = `Nenhum produto encontrado para o código: ${gtin}`;
        return;
      }

      this.addToCart(produto);
      this.snackBar.open(`✓ ${produto.produto}`, '', { duration: 1200 });
    } catch {
      this.lastError = 'Erro ao buscar produto. Tente novamente.';
    } finally {
      this.isSearching = false;
      setTimeout(() => this.barcodeInput?.nativeElement.focus(), 80);
    }
  }

  addToCart(produto: Produto): void {
    const existing = this.cart.find((item) => item.produto.id === produto.id);
    if (existing) {
      existing.quantidade++;
    } else {
      this.cart.push({ produto, quantidade: 1 });
    }
  }

  increaseQty(item: SaleItem): void { item.quantidade++; }

  decreaseQty(item: SaleItem): void {
    if (item.quantidade > 1) { item.quantidade--; } else { this.removeItem(item); }
  }

  removeItem(item: SaleItem): void {
    this.cart = this.cart.filter((i) => i !== item);
  }

  avancarParaPagamento(): void {
    this.stage = 'payment';
    this.processError = '';
  }

  voltarParaCarrinho(): void {
    this.stage = 'cart';
    setTimeout(() => this.barcodeInput?.nativeElement.focus(), 100);
  }

  async confirmarSemNfce(): Promise<void> {
    this.isProcessing = true;
    this.processError = '';
    try {
      await this.dashboardService.realizarVenda(
        this.cart.map((item) => ({ produtoId: item.produto.id, quantidade: item.quantidade }))
      );
      this.snackBar.open('Venda confirmada!', 'OK', { duration: 3000 });
      this.dialogRef.close(true);
    } catch {
      this.processError = 'Erro ao confirmar venda. Tente novamente.';
    } finally {
      this.isProcessing = false;
    }
  }

  async confirmarComNfce(): Promise<void> {
    this.isProcessing = true;
    this.processError = '';
    try {
      await this.dashboardService.realizarVenda(
        this.cart.map((item) => ({ produtoId: item.produto.id, quantidade: item.quantidade }))
      );

      const result = await this.dashboardService.emitirNfce({
        itens: this.cart.map((item) => ({
          sku: item.produto.sku,
          produto: item.produto.produto,
          ncm: item.produto.ncm ?? '',
          cfop: item.produto.cfop ?? '5102',
          unidade: item.produto.unidade ?? 'UN',
          quantidade: item.quantidade,
          valorUnitario: this.getPreco(item.produto),
          valorTotal: this.getPreco(item.produto) * item.quantidade,
        })),
        formaPagamento: this.formaPagamento,
        cpfComprador: this.cpfComprador.replace(/\D/g, '') || undefined,
      });

      this.nfceResult = result;
      this.stage = 'result';
    } catch (e: any) {
      this.processError = e?.message ?? 'Erro ao emitir NFC-e.';
    } finally {
      this.isProcessing = false;
    }
  }

  fechar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  getPreco(produto: Produto): number {
    return produto.valor_atual ?? produto.valor;
  }
}
