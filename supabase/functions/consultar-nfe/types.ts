export interface NfeProduto {
  cProd: string;
  xProd: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeConsultaResponse {
  produtos: NfeProduto[];
  emitente: string;
  dataEmissao: string;
}
