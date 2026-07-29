import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { BRAND } from './brand'

type NewsletterPostEmailProps = {
  topic: string
  previewText?: string | null
  body: string
  imageUrl?: string | null
  managePreferencesUrl: string
}

export default function NewsletterPostEmail({
  topic,
  previewText,
  body,
  imageUrl,
  managePreferencesUrl,
}: NewsletterPostEmailProps) {
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean)

  return (
    <Html>
      <Head />
      <Preview>{previewText || topic}</Preview>
      <Body
        style={{
          backgroundColor: BRAND.background,
          fontFamily: 'Helvetica, Arial, sans-serif',
          margin: 0,
          padding: '24px 0',
        }}
      >
        <Container
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            maxWidth: 600,
            overflow: 'hidden',
          }}
        >
          <Section style={{ backgroundColor: BRAND.navy, padding: '24px 32px' }}>
            <Text
              style={{
                color: BRAND.gold,
                fontSize: 20,
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              {BRAND.storeName}
            </Text>
          </Section>

          {imageUrl && (
            <Img
              src={imageUrl}
              alt=""
              width="600"
              style={{ display: 'block', height: 'auto', width: '100%' }}
            />
          )}

          <Section style={{ padding: '32px' }}>
            <Heading
              style={{
                color: BRAND.navy,
                fontSize: 26,
                lineHeight: 1.2,
                margin: '0 0 20px',
              }}
            >
              {topic}
            </Heading>

            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={{
                  color: BRAND.text,
                  fontSize: 15,
                  lineHeight: 1.65,
                  margin: index === paragraphs.length - 1 ? 0 : '0 0 16px',
                  whiteSpace: 'pre-line',
                }}
              >
                {paragraph}
              </Text>
            ))}

            <Hr style={{ borderColor: '#E5DED2', margin: '32px 0 20px' }} />

            <Section style={{ textAlign: 'center' }}>
              <Button
                href={managePreferencesUrl}
                style={{
                  backgroundColor: BRAND.navy,
                  borderRadius: 6,
                  color: BRAND.buttonText,
                  fontSize: 13,
                  fontWeight: 'bold',
                  padding: '11px 20px',
                }}
              >
                Manage newsletter preference
              </Button>
            </Section>
          </Section>

          <Section
            style={{
              backgroundColor: BRAND.background,
              padding: '16px 32px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: BRAND.text, fontSize: 11, margin: 0, opacity: 0.65 }}>
              You received this because you subscribed through your PokeSunshineTCG
              account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
