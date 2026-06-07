import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase-service';
import { Nota } from '../models/nota';
import { environment } from '../../environments/environments';

const COOKIE_KEY = 'obelisko_ultima_chave_nfe';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private readonly cientieFuncUrl = `${environment.supabaseUrl}/functions/v1/manifestar-ciente`;

  constructor(
    private supabaseService: SupabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async buscarNota(chave: string): Promise<Nota | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('notas')
      .select('*')
      .eq('chave', chave)
      .maybeSingle();
    if (error) throw error;
    return data as Nota | null;
  }

  async registrarNota(chave: string, manifesto: boolean): Promise<void> {
    const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await this.supabaseService.getClient()
      .from('notas')
      .insert({ usuario_id: user.id, chave, manifesto, ciente: null, produtos_importados: false });
    if (error) throw error;
  }

  async enviarCiente(chave: string): Promise<void> {
    const session = await this.supabaseService.getClient().auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(this.cientieFuncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chave }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? 'Erro ao enviar ciência da operação');
    }

    await this.atualizarCiente(chave);
  }

  async atualizarCiente(chave: string): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('notas')
      .update({ ciente: new Date().toISOString() })
      .eq('chave', chave);
    if (error) throw error;
  }

  async atualizarManifesto(chave: string, manifesto: boolean): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('notas')
      .update({ manifesto, atualizado_em: new Date().toISOString() })
      .eq('chave', chave);
    if (error) throw error;
  }

  async marcarProdutosImportados(chave: string): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('notas')
      .update({ produtos_importados: true, atualizado_em: new Date().toISOString() })
      .eq('chave', chave);
    if (error) throw error;
  }

  salvarCookie(chave: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(chave)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  lerCookie(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  }
}
