// app/page.tsx
// このファイルは、もし /inventory/tutor/main が最初のページなら、
// ログインページなどに使うか、または空にしておくことができます。
export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Welcome to the App!</h1>
      <p>Navigate to <a href="/inventory/tutor/main">/inventory/tutor/main</a> to see the main screen.</p>
      {/* または、ログインページへのリンクなど */}
    </div>
  );
}