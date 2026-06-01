export interface SoapParams {
  cnpj: string;
  chaveNfe: string;
}

function getUfCode(chaveNfe: string): string {
  return chaveNfe.substring(0, 2);
}

export function buildSoapEnvelope({ cnpj, chaveNfe }: SoapParams): string {
  const cUF = getUfCode(chaveNfe);

  const distDFeInt = `<distDFeInt versao="1.01" xmlns="http://www.portalfiscal.inf.br/nfe">` +
    `<tpAmb>1</tpAmb>` +
    `<cUFAutor>${cUF}</cUFAutor>` +
    `<CNPJ>${cnpj}</CNPJ>` +
    `<consChNFe><chNFe>${chaveNfe}</chNFe></consChNFe>` +
    `</distDFeInt>`;

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">` +
    `<nfeDadosMsg>${distDFeInt}</nfeDadosMsg>` +
    `</nfeDistDFeInteresse>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`;
}
