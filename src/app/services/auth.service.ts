import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase-service';
import { AppUser } from '../models/produto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  public user$: Observable<AppUser | null> = this.userSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private supabaseService: SupabaseService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
    }
  }

  async login(email: string, password: string): Promise<AppUser | null> {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const user = await this.buildUser(data.user.id, data.user.email!);
    this.userSubject.next(user);
    return user;
  }

  async logout(): Promise<void> {
    await this.supabaseService.getClient().auth.signOut();
    this.userSubject.next(null);
  }

  private async loadUser(): Promise<void> {
    const { data: { session } } = await this.supabaseService.getClient().auth.getSession();
    if (session?.user) {
      const user = await this.buildUser(session.user.id, session.user.email!);
      this.userSubject.next(user);
    }
  }

  private async buildUser(id: string, email: string): Promise<AppUser> {
    const { data: perfil } = await this.supabaseService.getClient()
      .from('perfil')
      .select('cnpj')
      .eq('id', id)
      .single();

    return {
      id,
      email,
      role: 'admin',
      cnpj: perfil?.cnpj ?? undefined,
    };
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }
}
