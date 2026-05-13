export const BRAND_TITLE = 'Contoso Bank · Command Center'

export const BRAND_DESCRIPTION =
  'Real-time operations view for queues, agents, and customer conversations across Contoso Bank contact center sites.'

const previewMetrics = [
  { label: 'Service level', value: '97.1%' },
  { label: 'Agents online', value: '142' },
  { label: 'CSAT', value: '4.8/5' },
  { label: 'Sites active', value: '6' },
]

export function BrandMark({ size = 160 }: { size?: number }) {
  const radius = Math.max(18, Math.round(size * 0.26))
  const innerRadius = Math.max(14, Math.round(size * 0.18))

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        border: '1px solid rgba(148, 216, 255, 0.24)',
        background: 'linear-gradient(145deg, #102349 0%, #081327 58%, #040914 100%)',
        boxShadow: '0 20px 40px rgba(3, 8, 20, 0.35)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 18%, rgba(125, 215, 255, 0.28), transparent 36%), radial-gradient(circle at 82% 78%, rgba(104, 255, 206, 0.18), transparent 30%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: Math.round(size * 0.08),
          borderRadius: innerRadius,
          border: '1px solid rgba(148, 216, 255, 0.08)',
        }}
      />
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        fill="none"
        style={{ position: 'relative' }}
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="#F5FBFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="#9BE8FF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="#68FFCE"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 22px',
        borderRadius: 24,
        border: '1px solid rgba(148, 216, 255, 0.14)',
        background: 'rgba(10, 21, 41, 0.74)',
      }}
    >
      <span
        style={{
          fontSize: 14,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8EA3C3',
        }}
      >
        {label}
      </span>
      <span
        style={{
          marginTop: 12,
          fontSize: 34,
          fontWeight: 700,
          color: '#F8FBFF',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function SocialPreview({ width, height }: { width: number; height: number }) {
  const large = height >= 620
  const headingSize = large ? 78 : 68
  const subheadingSize = large ? 30 : 26
  const markSize = large ? 276 : 240

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        padding: large ? '52px' : '42px',
        background: 'linear-gradient(135deg, #081120 0%, #0B1832 48%, #050914 100%)',
        color: '#F8FBFF',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 12% 12%, rgba(125, 215, 255, 0.18), transparent 30%), radial-gradient(circle at 88% 18%, rgba(83, 184, 255, 0.18), transparent 24%), radial-gradient(circle at 78% 85%, rgba(104, 255, 206, 0.16), transparent 26%)',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 12,
            height: 12,
            marginRight: 14,
            borderRadius: 999,
            background: '#68FFCE',
            boxShadow: '0 0 18px rgba(104, 255, 206, 0.72)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 18px',
            borderRadius: 999,
            border: '1px solid rgba(148, 216, 255, 0.18)',
            background: 'rgba(9, 18, 35, 0.74)',
            fontSize: 16,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#DCEBFF',
          }}
        >
          Live operations cockpit
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          flex: 1,
          gap: 32,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#8EA3C3',
              }}
            >
              Contoso Bank
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: headingSize,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.06em',
                maxWidth: width * 0.52,
              }}
            >
              Command Center
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: subheadingSize,
                lineHeight: 1.35,
                maxWidth: width * 0.48,
                color: '#B4C2DD',
              }}
            >
              Real-time visibility into agents, queues, sentiment, and site performance across the contact center network.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, marginTop: 'auto' }}>
            {previewMetrics.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </div>

        <div
          style={{
            width: markSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BrandMark size={markSize} />
        </div>
      </div>
    </div>
  )
}