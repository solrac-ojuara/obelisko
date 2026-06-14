import { SupabaseService } from './supabase-service';

describe('SupabaseService', () => {
  it('should be defined as a class', () => {
    expect(SupabaseService).toBeDefined();
  });

  it('should expose a getClient method', () => {
    expect(typeof SupabaseService.prototype.getClient).toBe('function');
  });
});
