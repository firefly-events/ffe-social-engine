export default function ContentPreviewPage({ params }) {
  const { id } = params;

  return (
    <div>
      <h1>Content Preview: {id}</h1>
      <div style={{ background: 'black', width: '300px', height: '533px', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <p>Video Player Placeholder</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button style={{ padding: '0.5rem 1rem', background: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
        <button style={{ padding: '0.5rem 1rem', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
        <a href={`/api/download/${id}`} download style={{ padding: '0.5rem 1rem', background: 'gray', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Download MP4</a>
      </div>
    </div>
  );
}
