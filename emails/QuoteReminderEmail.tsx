import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Tailwind, Row, Column } from '@react-email/components'

interface Props {
  quoteNumber: number; clientName: string; companyName: string; companyEmail?: string;
  propertyAddress: string; totalTTC: number; expiresAt: string; daysLeft: number;
  quoteUrl: string; items: { diagnostic_code: string | null; description: string; total: number }[];
}

const EUR = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function QuoteReminderEmail({ quoteNumber, clientName, companyName, companyEmail, propertyAddress, totalTTC, expiresAt, daysLeft, quoteUrl, items }: Props) {
  const num = String(quoteNumber).padStart(4, '0')
  return (
    <Html lang="fr"><Head />
      <Preview>⏰ Rappel : votre devis N°{num} expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''} — {companyName}</Preview>
      <Tailwind>
        <Body className="bg-zinc-100 font-sans">
          <Container className="mx-auto max-w-xl py-8 px-4">
            <Section className="bg-zinc-900 rounded-t-2xl px-8 py-5">
              <Heading className="text-white text-lg font-bold m-0">{companyName}</Heading>
            </Section>
            <Section className="bg-amber-500 px-8 py-3">
              <Text className="text-white text-sm font-bold m-0">⏰ Rappel — Devis N°{num} expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</Text>
            </Section>
            <Section className="bg-white px-8 py-6">
              <Text className="text-zinc-600 text-sm leading-relaxed m-0">Bonjour <strong>{clientName}</strong>,<br /><br />Votre devis pour le bien situé au <strong>{propertyAddress}</strong> expire le <strong>{expiresAt}</strong>.</Text>
              <Section style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: 16, margin: '16px 0' }}>
                <Text className="text-amber-800 text-sm font-semibold m-0">Il vous reste {daysLeft} jour{daysLeft > 1 ? 's' : ''} pour répondre</Text>
              </Section>
              {items.map((item, i) => (
                <Row key={i} style={{ borderBottom: '1px solid #f4f4f5', paddingTop: 8, paddingBottom: 8 }}>
                  <Column><Text className="text-sm text-zinc-800 m-0">{item.diagnostic_code && <span style={{ background: '#2563eb', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, marginRight: 8, fontWeight: 'bold' }}>{item.diagnostic_code}</span>}{item.description}</Text></Column>
                  <Column style={{ textAlign: 'right' }}><Text className="text-sm font-semibold text-zinc-800 m-0">{EUR(item.total)}</Text></Column>
                </Row>
              ))}
              <Hr className="border-zinc-200 my-2" />
              <Row><Column><Text className="text-base font-bold text-zinc-900 m-0">Total TTC</Text></Column><Column style={{ textAlign: 'right' }}><Text className="text-lg font-bold text-blue-600 m-0">{EUR(totalTTC)}</Text></Column></Row>
              <Section style={{ marginTop: 24 }}>
                <Button href={quoteUrl} className="bg-emerald-600 text-white text-sm font-bold rounded-xl px-8 py-4 block text-center">✓ Accepter le devis maintenant</Button>
              </Section>
              {companyEmail && <Text className="text-xs text-zinc-500 mt-4 m-0">Contact : {companyEmail}</Text>}
            </Section>
            <Section className="bg-zinc-900 rounded-b-2xl px-8 py-4">
              <Text className="text-zinc-500 text-xs text-center m-0">{companyName} · Devis N°{num} · Expire le {expiresAt}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
