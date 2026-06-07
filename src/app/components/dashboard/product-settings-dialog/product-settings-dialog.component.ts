import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Produto } from '../../../models/produto';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-product-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-settings-dialog.component.html',
})
export class ProductSettingsDialogComponent {
  editQuantidade: number;
  editValorAtual: number;
  isSaving = false;
  isDeleting = false;

  constructor(
    private dialogRef: MatDialogRef<ProductSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Produto,
    private dashboardService: DashboardService
  ) {
    this.editQuantidade = product.quantidade;
    this.editValorAtual = product.valor_atual ?? product.valor;
  }

  async save(): Promise<void> {
    this.isSaving = true;
    try {
      await this.dashboardService.updateProduct(this.product.id, {
        quantidade: this.editQuantidade,
        valor_atual: this.editValorAtual,
      });
      this.dialogRef.close('saved');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteProduct(): Promise<void> {
    if (!confirm(`Remover "${this.product.produto}" definitivamente?`)) return;
    this.isDeleting = true;
    try {
      await this.dashboardService.deleteProduct(this.product.id);
      this.dialogRef.close('deleted');
    } finally {
      this.isDeleting = false;
    }
  }
}
