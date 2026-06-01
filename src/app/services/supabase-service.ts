import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession: isBrowser,
          storage: isBrowser ? localStorage : undefined,
          detectSessionInUrl: isBrowser,
          lock: <R>(_: string, __: number, fn: () => Promise<R>) => fn(),
        },
      }
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}