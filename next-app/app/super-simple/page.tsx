export default function SuperSimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Super Simple Test Page
      </h1>
      <p style={{ color: '#666', lineHeight: '1.6' }}>
        This is the simplest possible page with no external dependencies.
        If this shows "Loading...", then there's a fundamental Next.js issue.
      </p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h2 style={{ color: '#333', marginTop: '0' }}>Environment Check</h2>
        <ul style={{ color: '#666' }}>
          <li>URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}</li>
          <li>Time: {new Date().toLocaleString()}</li>
          <li>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'Server-side rendering'}</li>
        </ul>
      </div>
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a 
          href="/" 
          style={{ 
            color: '#0070f3', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #0070f3',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          Go to Main Page
        </a>
      </div>
    </div>
  );
}
