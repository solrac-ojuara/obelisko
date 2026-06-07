export interface Nota {
  id?: string;
  usuario_id?: string;
  chave: string;
  manifesto: boolean | null;
  ciente: string | null;
  produtos_importados: boolean;
  criado_em?: string;
  atualizado_em?: string;
}
