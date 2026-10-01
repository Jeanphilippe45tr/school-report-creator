import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap, FileText, Users, Award, ShieldCheck,
  Calculator, Trophy, Building2, Printer,
  CheckCircle2, ChevronDown, Clock, BookOpen, Lock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BulletinPro — Bulletins scolaires automatiques" },
      { name: "description", content: "Plateforme pour enseignants et établissements : créez, calculez et imprimez les bulletins scolaires de vos élèves. Moyennes pondérées, rangs, mentions et PDF officiels — en quelques clics." },
      { property: "og:title", content: "BulletinPro — Bulletins scolaires automatiques" },
      { property: "og:description", content: "Créez, calculez et imprimez les bulletins scolaires de vos élèves en quelques clics. Conçu pour les écoles francophones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "BulletinPro — Bulletins scolaires automatiques" },
      { name: "twitter:description", content: "Créez, calculez et imprimez les bulletins scolaires de vos élèves en quelques clics." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Classes & élèves", desc: "Créez vos classes, ajoutez vos élèves et définissez les matières avec leurs coefficients. Chaque enseignant ne voit que ses propres classes." },
  { icon: Calculator, title: "Calculs automatiques", desc: "Moyennes pondérées par coefficient, moyennes par matière, moyenne générale : tout est calculé instantanément, sans tableur ni erreur." },
  { icon: Trophy, title: "Rangs & mentions", desc: "Le rang de chaque élève dans la classe et les mentions (Félicitations, Encouragements…) sont attribués automatiquement selon vos barèmes." },
  { icon: FileText, title: "Appréciations", desc: "Rédigez vos appréciations par matière et le motif général du conseil de classe, directement dans le bulletin." },
  { icon: Printer, title: "Bulletins PDF officiels", desc: "Un bulletin imprimable au format A4, avec en-tête de votre établissement, prêt à être signé et remis aux parents." },
  { icon: Lock, title: "Données sécurisées", desc: "Vos données sont hébergées de manière sécurisée et cloisonnées : personne d'autre que vous ne peut consulter vos classes et vos notes." },
];

const steps = [
  { n: "1", title: "Configurez votre établissement", desc: "Renseignez le nom de votre école, son logo et ses informations : ils apparaissent en en-tête de tous les bulletins." },
  { n: "2", title: "Créez vos classes et saisissez les notes", desc: "Ajoutez vos élèves, définissez les matières avec leurs coefficients, puis entrez les notes du trimestre." },
  { n: "3", title: "Générez les bulletins en un clic", desc: "Moyennes, rangs et mentions sont calculés automatiquement. Téléchargez le PDF et distribuez-le aux familles." },
];

const stats = [
  { value: "3 min", label: "pour générer le bulletin d'un élève" },
  { value: "100%", label: "des calculs automatiques — zéro erreur" },
  { value: "A4", label: "format officiel prêt à imprimer" },
  { value: "∞", label: "classes, élèves et trimestres" },
];

const faqs = [
  { q: "Qui peut consulter mes classes et mes notes ?", a: "Chaque enseignant dispose d'un compte personnel et ne peut accéder qu'à ses propres classes, élèves et bulletins. Vos données sont cloisonnées et sécurisées." },
  { q: "Les moyennes et les rangs sont-ils calculés automatiquement ?", a: "Oui. Dès la saisie des notes, BulletinPro calcule les moyennes par matière, la moyenne générale pondérée par coefficients, le rang de l'élève et les mentions selon vos barèmes." },
  { q: "Puis-je ajouter le nom et le logo de mon établissement ?", a: "Oui, depuis la page Établissement. Ces informations apparaissent en en-tête de chaque bulletin PDF, avec le trimestre et l'année scolaire." },
  { q: "Puis-je modifier un bulletin après l'avoir généré ?", a: "Bien sûr. Ouvrez le bulletin, ajustez les notes ou les appréciations : les moyennes et le rang sont recalculés instantanément et le PDF mis à jour." },
  { q: "Faut-il installer un logiciel ?", a: "Non. BulletinPro fonctionne entièrement dans votre navigateur, sur ordinateur comme sur tablette. Rien à installer, rien à mettre à jour." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-medium text-foreground">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

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
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalités</a>
            <a href="#etapes" className="hover:text-foreground">Comment ça marche</a>
            <a href="#temoignages" className="hover:text-foreground">Témoignages</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/auth">
              <Button>Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Gratuit pour commencer", "Sans installation", "Données sécurisées"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary">
        <div className="container mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl font-bold text-primary">{s.value}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="container mx-auto px-6 py-20 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Tout ce qu'il faut pour vos bulletins</h2>
          <p className="mt-4 text-muted-foreground">
            De la création des classes à l'impression du bulletin officiel, BulletinPro accompagne chaque étape du trimestre.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="h-11 w-11 rounded-lg bg-primary-soft text-primary grid place-items-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="etapes" className="border-y border-border bg-primary-soft/60 scroll-mt-20">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Vos bulletins en trois étapes</h2>
            <p className="mt-4 text-muted-foreground">Simple comme un cahier de notes, mais sans les calculs.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif font-bold text-lg">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 h-6 w-6 border-t-2 border-r-2 border-border rotate-45" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aperçu du bulletin */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Un bulletin digne de votre école</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Chaque bulletin reprend les codes du document officiel : en-tête de l'établissement,
              tableau des matières avec coefficients, appréciations et décision du conseil de classe.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "En-tête personnalisé avec le nom et le logo de l'établissement",
                "Moyennes par matière, coefficients et moyenne générale",
                "Rang de l'élève et mention attribuée automatiquement",
                "Appréciations détaillées par matière",
                "PDF A4 prêt à imprimer, à signer et à remettre aux parents",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)] overflow-hidden">
            <div className="border-b border-border bg-secondary px-6 py-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-foreground">École Secondaire La Réussite</div>
                <div className="text-xs text-muted-foreground">Bulletin du 1<sup>er</sup> trimestre · Année 2025–2026</div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-baseline justify-between">
                <div className="font-medium text-foreground">Awa Diallo — 3<sup>e</sup> A</div>
                <div className="text-xs text-muted-foreground">Rang 3 / 28</div>
              </div>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-1.5 font-medium">Matière</th>
                    <th className="py-1.5 font-medium text-center">Coef.</th>
                    <th className="py-1.5 font-medium text-right">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: "Mathématiques", c: 4, n: "14,5" },
                    { m: "Français", c: 4, n: "16,0" },
                    { m: "Anglais", c: 2, n: "15,0" },
                    { m: "SVT", c: 2, n: "13,5" },
                    { m: "Histoire-Géographie", c: 2, n: "15,5" },
                  ].map((r) => (
                    <tr key={r.m} className="border-b border-border/60 last:border-0">
                      <td className="py-2 text-foreground">{r.m}</td>
                      <td className="py-2 text-center text-muted-foreground">{r.c}</td>
                      <td className="py-2 text-right font-medium text-primary">{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-soft px-4 py-3">
                <span className="text-sm font-medium text-secondary-foreground">Moyenne générale</span>
                <span className="font-serif text-2xl font-bold text-primary">15,1<span className="text-sm text-muted-foreground font-sans">/20</span></span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground italic">
                Mention : Félicitations — « Excellent trimestre, continuez ainsi. »
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="border-y border-border bg-secondary scroll-mt-20">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ils ont adopté BulletinPro</h2>
            <p className="mt-4 text-muted-foreground">Enseignants et directions qui ont dit adieu aux tableurs.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { name: "Mme Koffi", role: "Directrice, École primaire Les Palmiers", quote: "Nous préparions les bulletins à la main pendant des semaines. Aujourd'hui, tout est prêt en une après-midi." },
              { name: "M. Bamba", role: "Professeur de mathématiques, Collège Notre-Dame", quote: "Les moyennes pondérées et les rangs se calculent tout seuls. Je saisis les notes, le bulletin est prêt." },
              { name: "Mme Traoré", role: "Enseignante, Lycée Moderne de Bouaké", quote: "Le PDF est propre et professionnel, avec notre en-tête. Les parents apprécient vraiment la présentation." },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="flex gap-1 text-gold" aria-label="5 étoiles">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Award key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-foreground leading-relaxed">« {t.quote} »</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-6 py-20 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Questions fréquentes</h2>
          <p className="mt-4 text-muted-foreground">Tout ce que vous devez savoir avant de commencer.</p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-gold" />
          <h2 className="mt-4 text-3xl md:text-4xl font-bold">Prêt à simplifier vos bulletins ?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Créez votre compte gratuitement et générez votre premier bulletin en quelques minutes.
          </p>
          <Link to="/auth" className="inline-block mt-8">
            <Button size="lg" variant="secondary" className="h-12 px-8">Démarrer maintenant</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-serif text-lg font-bold text-primary">BulletinPro</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                La plateforme simple et sécurisée pour créer, calculer et imprimer les bulletins scolaires de vos élèves.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Produit</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalités</a></li>
                <li><a href="#etapes" className="hover:text-foreground">Comment ça marche</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Bon à savoir</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Premier bulletin en 3 minutes</li>
                <li className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Format officiel A4</li>
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Écoles, collèges et lycées</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BulletinPro. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
