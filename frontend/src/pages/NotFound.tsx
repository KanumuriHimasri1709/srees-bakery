import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteChrome } from "../components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="section-pad text-center">
        <div className="container max-w-md mx-auto py-16">
          <div className="eyebrow">404 Error</div>
          <h1 className="serif text-4xl mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link className="btn btn-primary inline-flex items-center gap-2" href="/">
            <ArrowLeft size={16} /> Return Home
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
