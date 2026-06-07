import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NfeService } from '../../../services/nfe.service';
import { NotaService } from '../../../services/nota.service';
import { NfeProduto, NfeConsultaResponse } from '../../../models/nfe';

@Component({
  selector: 'app-add-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-purchase-modal.component.html',
})
export class AddPurchaseModalComponent implements OnInit, OnDestroy {
  @Output() importar = new EventEmitter<NfeProduto[]>();
  @Output() cancelar = new EventEmitter<void>();

  step: 'input' | 'waiting' | 'preview' = 'input';
  chaveNfe: string = '';
  isLoading: boolean = false;
  error: string = '';
  nfeData: NfeConsultaResponse | null = null;
  cooldownSeconds = 0;
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  get chaveNfeLen(): number {
    return this.chaveNfe.replace(/\D/g, '').length;
  }

  constructor(
    private nfeService: NfeService,
    private notaService: NotaService
  ) {}

  ngOnInit(): void {
    const saved = this.notaService.lerCookie();
    if (saved) this.chaveNfe = saved;
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  private startCooldown(): void {
    this.cooldownSeconds = 60;
    this.cooldownInterval = setInterval(() => {
      this.cooldownSeconds--;
      if (this.cooldownSeconds <= 0) this.clearCooldown();
    }, 1000);
  }

  private clearCooldown(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = null;
    }
    this.cooldownSeconds = 0;
  }

  async onBuscar(): Promise<void> {
    const chave = this.chaveNfe.trim().replace(/\D/g, '');
    if (chave.length !== 44) {
      this.error = 'A chave de acesso deve ter exatamente 44 dígitos.';
      return;
    }
    this.error = '';
    this.isLoading = true;
    try {
      this.nfeData = await this.nfeService.consultar({ chaveNfe: chave });
      const notaExistente = await this.notaService.buscarNota(chave);

      if (!notaExistente) {
        const temProdutos = this.nfeData.produtos.length > 0;
        await this.notaService.registrarNota(chave, temProdutos);
        try {
          await this.notaService.enviarCiente(chave);
        } catch {
          // Focus API pode falhar; nota já está registrada
        }
        this.notaService.salvarCookie(chave);
        this.step = temProdutos ? 'preview' : 'waiting';
        return;
      }

      if (notaExistente.manifesto === true) {
        this.step = 'preview';
        return;
      }

      const temProdutos = this.nfeData.produtos.length > 0;

      if (temProdutos) {
        await this.notaService.atualizarManifesto(chave, true);
        if (!notaExistente.ciente) {
          await this.notaService.atualizarCiente(chave);
        }
        this.step = 'preview';
      } else {
        await this.notaService.atualizarManifesto(chave, false);
        this.step = 'waiting';
      }
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao consultar nota fiscal.';
    } finally {
      this.isLoading = false;
      this.startCooldown();
    }
  }

  async onImportar(): Promise<void> {
    if (!this.nfeData) return;
    const chave = this.chaveNfe.trim().replace(/\D/g, '');
    this.importar.emit(this.nfeData.produtos);
    await this.notaService.marcarProdutosImportados(chave).catch(() => {});
  }

  onVoltar(): void {
    this.step = 'input';
    this.error = '';
    this.nfeData = null;
  }

  onCancelar(): void {
    this.step = 'input';
    this.chaveNfe = '';
    this.error = '';
    this.nfeData = null;
    this.cancelar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.onCancelar();
    }
  }
}
