export default function Footer() {
  return (
    <footer className="mt-auto border-t py-8 text-center text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} NewsFlash. All rights reserved.</p>
        <p className="text-sm">Powered by NewsAPI</p>
      </div>
    </footer>
  );
}
