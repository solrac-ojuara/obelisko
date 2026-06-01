export interface NfeProduto {
  cProd: string;
  xProd: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeConsultaRequest {
  cnpj: string;
  chaveNfe: string;
  certPassword: string;
}

export interface NfeConsultaResponse {
  produtos: NfeProduto[];
  emitente: string;
  dataEmissao: string;
}
