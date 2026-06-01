import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Injectable({
  providedIn: 'root',
})
export class CertificadoService {
  private readonly BUCKET = 'certificados';

  constructor(private supabaseService: SupabaseService) {}

  private buildFileName(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/[.\-\/]/g, '');
    return `certificado_${cnpjLimpo}.pfx`;
  }

  async upload(file: File, cnpj: string): Promise<string> {
    const fileName = this.buildFileName(cnpj);

    const { error } = await this.supabaseService
      .getClient()
      .storage.from(this.BUCKET)
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    return fileName;
  }

  async getSignedUrl(cnpj: string, expiresInSeconds = 3600): Promise<string> {
    const fileName = this.buildFileName(cnpj);

    const { data, error } = await this.supabaseService
      .getClient()
      .storage.from(this.BUCKET)
      .createSignedUrl(fileName, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  }

  async exists(cnpj: string): Promise<boolean> {
    const fileName = this.buildFileName(cnpj);

    const { data } = await this.supabaseService
      .getClient()
      .storage.from(this.BUCKET)
      .list('', { search: fileName });

    return (data ?? []).some((f) => f.name === fileName);
  }

  async delete(cnpj: string): Promise<void> {
    const fileName = this.buildFileName(cnpj);

    const { error } = await this.supabaseService
      .getClient()
      .storage.from(this.BUCKET)
      .remove([fileName]);

    if (error) throw error;
  }

  async updatePerfil(userId: string, cnpj: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('perfil')
      .upsert({ id: userId, cnpj }, { onConflict: 'id' });

    if (error) throw error;
  }
}
