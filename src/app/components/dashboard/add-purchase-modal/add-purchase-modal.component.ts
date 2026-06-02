import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NfeService } from '../../../services/nfe.service';
import { NfeProduto, NfeConsultaResponse } from '../../../models/nfe';

@Component({
  selector: 'app-add-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-purchase-modal.component.html',
})
export class AddPurchaseModalComponent {
  @Output() importar = new EventEmitter<NfeProduto[]>();
  @Output() cancelar = new EventEmitter<void>();

  step: 'input' | 'preview' = 'input';
  chaveNfe: string = '';
  isLoading: boolean = false;
  error: string = '';
  nfeData: NfeConsultaResponse | null = null;

  get chaveNfeLen(): number {
    return this.chaveNfe.replace(/\D/g, '').length;
  }

  constructor(private nfeService: NfeService) {}

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
      this.step = 'preview';
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao consultar nota fiscal.';
    } finally {
      this.isLoading = false;
    }
  }

  onImportar(): void {
    if (this.nfeData) {
      this.importar.emit(this.nfeData.produtos);
    }
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
