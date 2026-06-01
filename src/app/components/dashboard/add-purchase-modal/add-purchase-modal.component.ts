import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
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
export class AddPurchaseModalComponent implements OnChanges {
  @Input() cnpj: string = '';
  @Output() importar = new EventEmitter<NfeProduto[]>();
  @Output() cancelar = new EventEmitter<void>();

  step: 'input' | 'preview' = 'input';
  cnpjInput: string = '';
  chaveNfe: string = '';
  certPassword: string = '';
  isLoading: boolean = false;
  error: string = '';
  nfeData: NfeConsultaResponse | null = null;

  ngOnChanges(): void {
    if (this.cnpj && !this.cnpjInput) {
      this.cnpjInput = this.cnpj;
    }
  }

  constructor(private nfeService: NfeService) {}

  async onBuscar(): Promise<void> {
    const cnpj = this.cnpjInput.trim().replace(/[.\-\/]/g, '');
    if (cnpj.length !== 14) {
      this.error = 'Informe o CNPJ completo (14 dígitos).';
      return;
    }
    if (this.chaveNfe.trim().length !== 44) {
      this.error = 'A chave de acesso deve ter exatamente 44 dígitos.';
      return;
    }
    if (!this.certPassword.trim()) {
      this.error = 'Informe a senha do certificado.';
      return;
    }
    this.error = '';
    this.isLoading = true;
    try {
      this.nfeData = await this.nfeService.consultar({
        cnpj: this.cnpjInput.trim(),
        chaveNfe: this.chaveNfe.trim(),
        certPassword: this.certPassword,
      });
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
    this.cnpjInput = this.cnpj;
    this.chaveNfe = '';
    this.certPassword = '';
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
