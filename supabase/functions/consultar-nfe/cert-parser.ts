import forge from "npm:node-forge@1.3.1";

export interface ParsedCert {
  pemCert: string;
  pemKey: string;
}

function findBagByType(p12: forge.pkcs12.Pkcs12Pfx, type: string) {
  return p12.getBags({ bagType: type })[type] ?? [];
}

export function parsePfx(pfxBase64: string, password: string): ParsedCert {
  const pfxDer = forge.util.decode64(pfxBase64);
  const pfxAsn1 = forge.asn1.fromDer(pfxDer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  const certBags = findBagByType(p12, forge.pki.oids.certBag);
  const keyBags = findBagByType(p12, forge.pki.oids.pkcs8ShroudedKeyBag);

  if (certBags.length === 0 || !certBags[0]?.cert) throw new Error("Certificado não encontrado no .pfx");
  if (!keyBags[0]?.key) throw new Error("Chave privada não encontrada no .pfx");

  // Concatena toda a cadeia: certificado do usuário + CAs intermediárias
  const pemCert = certBags
    .filter((b) => b.cert)
    .map((b) => forge.pki.certificateToPem(b.cert!))
    .join("\n");

  const pemKey = forge.pki.privateKeyToPem(keyBags[0].key!);

  return { pemCert, pemKey };
}
