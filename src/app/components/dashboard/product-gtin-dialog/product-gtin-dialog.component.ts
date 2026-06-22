import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../../services/dashboard.service';
import { Produto } from '../../../models/produto';

@Component({
  selector: 'app-product-gtin-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title style="font-size:1rem; font-weight:700; color:#001F3F; margin:0; padding:20px 24px 4px">
      {{ data.gtin ? 'Editar Código' : 'Adicionar Código' }}
    </h2>

    <mat-dialog-content style="padding:8px 24px 4px; min-width:340px">
      <p style="font-size:0.8rem; color:#6b7280; margin:0 0 14px; line-height:1.4">
        {{ data.produto }}
      </p>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Código de barras (GTIN / EAN)</mat-label>
        <input
          matInput
          #gtinInput
          [(ngModel)]="gtinValue"
          placeholder="Ex: 7891234567890"
          autocomplete="off"
          (keyup.enter)="save()"
        />
        <mat-icon matSuffix>qr_code_scanner</mat-icon>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding:8px 24px 16px; gap:8px">
      <button mat-button mat-dialog-close [disabled]="isSaving">Cancelar</button>
      <button
        mat-flat-button
        (click)="save()"
        [disabled]="!gtinValue.trim() || isSaving"
        style="background:linear-gradient(135deg,#FFD700,#F5C400); color:#001F3F; font-weight:700; display:inline-flex; align-items:center; gap:6px"
      >
        <mat-spinner *ngIf="isSaving" diameter="16"></mat-spinner>
        <mat-icon *ngIf="!isSaving">check</mat-icon>
        Salvar
      </button>
    </mat-dialog-actions>
  `,
})
export class ProductGtinDialogComponent implements AfterViewInit {
  @ViewChild('gtinInput') gtinInput!: ElementRef<HTMLInputElement>;

  gtinValue: string;
  isSaving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Produto,
    private dialogRef: MatDialogRef<ProductGtinDialogComponent>,
    private dashboardService: DashboardService
  ) {
    this.gtinValue = data.gtin ?? '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.gtinInput?.nativeElement.focus(), 100);
  }

  async save(): Promise<void> {
    const gtin = this.gtinValue.trim();
    if (!gtin || this.isSaving) return;
    this.isSaving = true;
    try {
      await this.dashboardService.linkGtinToProduct(this.data.id, gtin);
      this.dialogRef.close(gtin);
    } catch {
      this.isSaving = false;
    }
  }
}
