export interface NfeProduto {
  cProd: string;
  xProd: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeConsultaRequest {
  chaveNfe: string;
}

export interface NfeConsultaResponse {
  produtos: NfeProduto[];
  emitente: string;
  dataEmissao: string;
  nfe_completa: boolean;
  situacao: string;
  manifestacao_destinatario: string | null;
}
