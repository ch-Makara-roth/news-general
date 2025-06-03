
export default function Footer() {
  return (
    <footer className="mt-auto border-t py-8 text-muted-foreground">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} NewsFlash. All rights reserved.</p>
        <p className="text-sm">Powered by NewsAPI</p>
      </div>
    </footer>
  );
}
