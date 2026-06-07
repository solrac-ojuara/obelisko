import type { FocusNfeResponse } from "./focus-client.ts";
import type { NfeProduto, NfeConsultaResponse } from "./types.ts";

export function mapFocusResponse(data: FocusNfeResponse): NfeConsultaResponse {
  const itens = data.requisicao_nota_fiscal?.itens ?? [];

  const produtos: NfeProduto[] = itens.map((item) => ({
    cProd: item.codigo_produto ?? "",
    xProd: item.descricao ?? "",
    ncm: item.codigo_ncm ?? "",
    quantidade: parseFloat(item.quantidade_comercial) || 0,
    valorUnitario: parseFloat(item.valor_unitario_comercial) || 0,
    valorTotal: parseFloat(item.valor_bruto) || 0,
  }));

  return {
    produtos,
    emitente: data.requisicao_nota_fiscal?.nome_emitente ?? data.nome_emitente ?? "",
    dataEmissao: data.requisicao_nota_fiscal?.data_emissao ?? data.data_emissao ?? "",
    nfe_completa: data.nfe_completa ?? false,
    situacao: data.situacao ?? "",
    manifestacao_destinatario: data.manifestacao_destinatario ?? null,
  };
}
