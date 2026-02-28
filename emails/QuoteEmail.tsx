import { Body, Button, Column, Container, Head, Heading, Hr, Html, Preview, Row, Section, Text, Tailwind } from '@react-email/components'

interface Item { diagnostic_code: string | null; description: string; quantity: number; unit_price: number; total: number }
interface Props {
  quoteNumber: number; clientName: string; companyName: string;
  propertyAddress: string; propertyType: string; transactionType: string;
  interventionDate: string | null; validityDays: number;
  totalHT: number; tvaRate: number; totalTTC: number;
  items: Item[]; notes?: string | null; quoteUrl: string;
}

const EUR = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const PROPERTY: Record<string,string> = { appartement:'Appartement', maison:'Maison', local_commercial:'Local commercial', autre:'Autre' }
const TRANSACTION: Record<string,string> = { vente:'Vente', location:'Location', avant_travaux:'Avant travaux', autre:'Autre' }

export default function QuoteEmail({ quoteNumber, clientName, companyName, propertyAddress, propertyType, transactionType, interventionDate, validityDays, totalHT, tvaRate, totalTTC, items, notes, quoteUrl }: Props) {
  const num = String(quoteNumber).padStart(4, '0')
  const expiry = new Date(); expiry.setDate(expiry.getDate() + validityDays)

  return (
    <Html lang="fr"><Head />
      <Preview>Votre devis de diagnostics immobiliers — {companyName} — {EUR(totalTTC)}</Preview>
      <Tailwind>
        <Body className="bg-zinc-100 font-sans">
          <Container className="mx-auto max-w-xl py-8 px-4">
            <Section className="bg-zinc-900 rounded-t-2xl px-8 py-6">
              <Heading className="text-white text-xl font-bold m-0">{companyName}</Heading>
              <Text className="text-zinc-400 text-xs mt-1 mb-0">Diagnostics Immobiliers Certifiés</Text>
            </Section>
            <Section className="bg-blue-600 px-8 py-3">
              <Text className="text-white text-sm font-semibold m-0">Devis N° {num} — Diagnostics immobiliers</Text>
            </Section>
            <Section className="bg-white px-8 py-6">
              <Text className="text-zinc-600 text-sm leading-relaxed">Bonjour <strong>{clientName}</strong>,<br /><br />Veuillez trouver ci-dessous votre devis pour la réalisation des diagnostics immobiliers.</Text>
              <Section style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16, margin: '16px 0' }}>
                <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wide m-0 mb-2">Bien à diagnostiquer</Text>
                <Text className="text-sm font-semibold text-zinc-900 m-0">{propertyAddress}</Text>
                <Text className="text-xs text-zinc-500 m-0 mt-1">{PROPERTY[propertyType] ?? propertyType} — {TRANSACTION[transactionType] ?? transactionType}{interventionDate && ` — Intervention : ${new Date(interventionDate).toLocaleDateString('fr-FR')}`}</Text>
              </Section>
              <Button href={quoteUrl} className="bg-blue-600 text-white text-sm font-medium rounded-xl px-6 py-3 block text-center">Consulter et accepter le devis</Button>
              <Hr className="border-zinc-200 my-6" />
              {items.map((item, i) => (
                <Row key={i} style={{ borderBottom: '1px solid #f4f4f5', paddingBottom: 8, paddingTop: 8 }}>
                  <Column>
                    <Text className="text-sm text-zinc-800 m-0">
                      {item.diagnostic_code && <span style={{ background: '#2563eb', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, marginRight: 8, fontWeight: 'bold' }}>{item.diagnostic_code}</span>}
                      {item.description}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><Text className="text-sm font-semibold text-zinc-800 m-0">{EUR(item.total)}</Text></Column>
                </Row>
              ))}
              <Hr className="border-zinc-200 my-2" />
              <Row><Column><Text className="text-sm text-zinc-500 m-0">Sous-total HT</Text></Column><Column style={{ textAlign: 'right' }}><Text className="text-sm m-0">{EUR(totalHT)}</Text></Column></Row>
              <Row><Column><Text className="text-sm text-zinc-500 m-0">TVA ({tvaRate}%)</Text></Column><Column style={{ textAlign: 'right' }}><Text className="text-sm m-0">{EUR(totalHT * (tvaRate / 100))}</Text></Column></Row>
              <Row style={{ background: '#2563eb', borderRadius: 8 }}>
                <Column><Text className="text-sm font-bold text-white px-3 py-2 m-0">Total TTC</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text className="text-lg font-bold text-white px-3 py-2 m-0">{EUR(totalTTC)}</Text></Column>
              </Row>
              <Text className="text-xs text-zinc-400 mt-4 m-0">Ce devis est valable jusqu&apos;au <strong>{expiry.toLocaleDateString('fr-FR')}</strong>.</Text>
              {notes && <><Hr className="border-zinc-200 mt-4" /><Text className="text-sm text-zinc-600">{notes}</Text></>}
            </Section>
            <Section className="bg-zinc-900 rounded-b-2xl px-8 py-4">
              <Text className="text-zinc-500 text-xs text-center m-0">{companyName} — Devis N°{num} — Non contractuel avant signature</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
