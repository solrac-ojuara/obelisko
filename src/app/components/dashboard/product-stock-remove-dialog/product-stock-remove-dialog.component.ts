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
  selector: 'app-product-stock-remove-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-stock-remove-dialog.component.html',
})
export class ProductStockRemoveDialogComponent {
  quantidadeRemover = 1;
  isRemoving = false;

  constructor(
    private dialogRef: MatDialogRef<ProductStockRemoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Produto,
    private dashboardService: DashboardService
  ) {}

  async remove(): Promise<void> {
    if (this.quantidadeRemover <= 0) return;
    this.isRemoving = true;
    try {
      const novaQuantidade = Math.max(0, this.product.quantidade - this.quantidadeRemover);
      await this.dashboardService.updateProduct(this.product.id, { quantidade: novaQuantidade });
      this.dialogRef.close('removed');
    } finally {
      this.isRemoving = false;
    }
  }
}
