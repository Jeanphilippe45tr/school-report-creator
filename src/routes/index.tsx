import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, FileText, Users, Award, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BulletinPro — Bulletins scolaires automatiques" },
      { name: "description", content: "Plateforme pour enseignants et établissements : créez, calculez et imprimez les bulletins scolaires de vos élèves." },
      { property: "og:title", content: "BulletinPro" },
      { property: "og:description", content: "Bulletins scolaires automatiques pour enseignants et établissements." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-bold text-primary">BulletinPro</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/auth">
              <Button>Commencer gratuitement</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary-soft),transparent_60%)]" />
        <div className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Award className="h-4 w-4 text-gold" /> Conçu pour les écoles francophones
          </span>
          <h1 className="mt-8 text-5xl md:text-6xl font-bold text-primary leading-tight">
            Les bulletins scolaires,<br />
            <span className="italic text-foreground">enfin simples.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Gérez vos classes, saisissez les notes par matière et générez des bulletins
            officiels en PDF — moyennes, rangs et appréciations calculés automatiquement.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base">Créer mon compte</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">J'ai déjà un compte</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Classes & élèves", desc: "Organisez vos classes, ajoutez vos élèves et gérez les matières avec leurs coefficients." },
            { icon: FileText, title: "Saisie des notes", desc: "Entrez les notes par matière. Les moyennes pondérées et le rang sont calculés automatiquement." },
            { icon: Download, title: "Bulletins PDF", desc: "Téléchargez un bulletin officiel imprimable, prêt à être remis aux parents." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="h-11 w-11 rounded-lg bg-primary-soft text-primary grid place-items-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-gold" />
          <h2 className="mt-4 text-3xl md:text-4xl font-bold">Vos données sont en sécurité</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Chaque enseignant accède uniquement à ses propres classes, élèves et bulletins.
          </p>
          <Link to="/auth" className="inline-block mt-8">
            <Button size="lg" variant="secondary" className="h-12 px-8">Démarrer maintenant</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BulletinPro. Tous droits réservés.
      </footer>
    </div>
  );
}
