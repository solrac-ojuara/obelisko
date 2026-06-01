import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificadoService } from '../../../services/certificado.service';

@Component({
  selector: 'app-certificado-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificado-upload.component.html',
})
export class CertificadoUploadComponent implements OnInit {
  @Input() cnpj: string = '';
  @Input() userId: string = '';
  @Output() uploaded = new EventEmitter<string>();

  hasExisting = false;
  isLoading = false;
  isChecking = true;
  error = '';
  success = '';

  constructor(private certificadoService: CertificadoService) {}

  async ngOnInit(): Promise<void> {
    if (this.cnpj) {
      this.hasExisting = await this.certificadoService.exists(this.cnpj);
    }
    this.isChecking = false;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.cnpj) return;

    const allowed = ['.pfx', '.p12', '.pem', '.cer'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      this.error = 'Formato inválido. Use .pfx, .p12, .pem ou .cer';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    try {
      const path = await this.certificadoService.upload(file, this.cnpj);
      await this.certificadoService.updatePerfil(this.userId, this.cnpj);
      this.hasExisting = true;
      this.success = 'Certificado enviado com sucesso!';
      this.uploaded.emit(path);
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao enviar certificado.';
    } finally {
      this.isLoading = false;
      input.value = '';
    }
  }

  async onDelete(): Promise<void> {
    if (!confirm('Remover certificado digital?')) return;
    this.isLoading = true;
    this.error = '';
    try {
      await this.certificadoService.delete(this.cnpj);
      this.hasExisting = false;
      this.success = 'Certificado removido.';
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao remover certificado.';
    } finally {
      this.isLoading = false;
    }
  }
}
