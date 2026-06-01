import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { NfeConsultaRequest, NfeConsultaResponse } from '../models/nfe';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class NfeService {
  private readonly functionUrl = `${environment.supabaseUrl}/functions/v1/consultar-nfe`;

  constructor(private supabaseService: SupabaseService) {}

  async consultar(req: NfeConsultaRequest): Promise<NfeConsultaResponse> {
    const session = await this.supabaseService.getClient().auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(this.functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(err.message ?? 'Erro ao consultar nota fiscal');
    }

    return response.json();
  }
}
