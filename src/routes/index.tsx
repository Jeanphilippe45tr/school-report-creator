import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, FileText, Users, ShieldCheck, Wallet, Building2, CheckCircle2, ChevronDown, CalendarDays, BookOpen, ClipboardCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import campusImage from "@/assets/campus-home.jpg";

const description = "CampusManager centralise la gestion de votre établissement : classes et élèves, notes et bulletins, frais scolaires en FCFA, vie scolaire et emploi du temps.";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "CampusManager — Votre établissement, une gestion unifiée" },
    { name: "description", content: description },
    { property: "og:title", content: "CampusManager — Votre établissement, une gestion unifiée" },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Classes & élèves", desc: "Organisez vos classes, inscrivez les élèves et retrouvez leurs informations. Définissez les matières et leurs coefficients pour chaque classe." },
  { icon: Wallet, title: "Finances scolaires", desc: "Fixez les frais par classe, de l’inscription aux trois tranches. Enregistrez les paiements en FCFA et suivez les montants versés et les restes à payer." },
  { icon: BookOpen, title: "Notes & bulletins", desc: "Saisissez les notes de toute une classe par matière, avec deux séquences par trimestre. Préparez les bulletins trimestriels et annuels en PDF." },
  { icon: ClipboardCheck, title: "Vie scolaire", desc: "Consignez les absences et les retards, puis enregistrez les sanctions et les convocations des parents pour suivre le parcours des élèves." },
  { icon: CalendarDays, title: "Emploi du temps", desc: "Organisez les cours du lundi au samedi pour chaque classe : horaires, matières, enseignants et salles, réunis dans une grille hebdomadaire." },
  { icon: Building2, title: "Votre établissement", desc: "Renseignez les informations de votre école et personnalisez vos modèles de bulletins, avec l’en-tête officiel bilingue français et anglais." },
];
const steps = [
  { title: "Installez les bases", desc: "Créez votre compte, renseignez votre établissement, puis ajoutez les classes, les élèves et les matières." },
  { title: "Organisez le quotidien", desc: "Définissez les tranches de scolarité et les emplois du temps. Enregistrez les paiements et les événements de vie scolaire." },
  { title: "Suivez l’année scolaire", desc: "Complétez et corrigez les notes par séquence, suivez les soldes des élèves et préparez vos bulletins de fin de période." },
];
const faqs = [
  { q: "CampusManager gère-t-il toujours les bulletins ?", a: "Oui. La saisie des notes, les moyennes, les bulletins PDF et les modèles personnalisés restent disponibles. Ils font désormais partie d’une application qui couvre aussi les finances, la vie scolaire et les emplois du temps." },
  { q: "Comment fonctionne la saisie des notes ?", a: "Vous choisissez une classe, une matière et un trimestre. Tous les élèves de la classe s’affichent avec les deux séquences du trimestre. Vous pouvez saisir et modifier leurs notes, puis générer les bulletins trimestriels et annuels." },
  { q: "Puis-je suivre les frais scolaires par tranches ?", a: "Oui. Pour chaque classe, vous définissez l’inscription et les première, deuxième et troisième tranches, leurs montants et leurs échéances. Les paiements sont enregistrés par élève en FCFA, avec le reste à payer." },
  { q: "Que comprend la vie scolaire ?", a: "Vous pouvez enregistrer les absences, les retards et les sanctions, notamment les avertissements, les blâmes, les consignes, les exclusions et les convocations des parents." },
  { q: "Puis-je conserver mon format de bulletin ?", a: "Vous pouvez personnaliser un modèle manuellement, sans crédits IA, ou importer une photo ou un PDF pour en analyser la présentation. L’analyse automatique utilise des crédits IA ; elle n’est pas nécessaire pour utiliser les autres rubriques." },
  { q: "Faut-il installer un logiciel ?", a: "Non. CampusManager est accessible depuis votre navigateur. Connectez-vous à votre compte pour retrouver les informations de votre établissement." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return <div className="border-b border-border">
    <Button variant="ghost" onClick={() => setOpen(!open)} aria-expanded={open} className="h-auto w-full justify-between gap-4 rounded-none px-0 py-5 text-left whitespace-normal">
      <span className="font-medium">{q}</span><ChevronDown className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
    </Button>
    {open && <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>}
  </div>;
}

function Landing() {
  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span>
          <span className="font-serif text-xl font-bold text-primary">CampusManager</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground xl:flex">
          <a href="#fonctionnalites" className="hover:text-foreground">Les rubriques</a>
          <a href="#etapes" className="hover:text-foreground">Bien démarrer</a>
          <a href="#faq" className="hover:text-foreground">Questions fréquentes</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/auth">Se connecter</Link></Button>
          <Button asChild><Link to="/auth">Créer un compte<ArrowRight className="hidden size-4 sm:block" /></Link></Button>
        </div>
      </div>
    </header>

    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <img src={campusImage} alt="Cour d’un établissement scolaire, élèves et enseignant entre les cours" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-primary/75" />
      <div className="mx-auto max-w-7xl px-5 py-14 md:py-20 lg:px-8 lg:py-24">
        <p className="flex items-center gap-2 text-sm font-medium"><GraduationCap className="size-5 text-gold" /> Gestion d’établissement scolaire</p>
        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">CampusManager</h1>
        <p className="mt-4 max-w-xl font-serif text-2xl leading-snug sm:text-3xl">Votre établissement.<br />Une gestion unifiée.</p>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">Élèves, finances, vie scolaire, emplois du temps et bulletins : réunissez l’essentiel de votre école dans un seul espace.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button size="lg" variant="secondary" asChild><Link to="/auth">Créer mon compte<ArrowRight className="size-4" /></Link></Button>
          <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild><a href="#fonctionnalites">Découvrir les rubriques</a></Button>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary-foreground/90">
          {["Sans installation", "Frais en FCFA", "Système scolaire camerounais"].map(t => <span key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-gold" />{t}</span>)}
        </div>
      </div>
    </section>

    <section className="border-b border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 text-center md:grid-cols-4 lg:px-8">
        {[{ value: "6", label: "rubriques pour votre établissement" }, { value: "3 × 2", label: "trimestres et séquences" }, { value: "FCFA", label: "suivi des frais scolaires" }, { value: "FR / EN", label: "en-tête officiel des bulletins" }].map(s => <div key={s.value}><p className="font-serif text-3xl font-bold text-primary">{s.value}</p><p className="mt-2 text-sm text-muted-foreground">{s.label}</p></div>)}
      </div>
    </section>

    <section id="fonctionnalites" className="scroll-mt-28">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <p className="text-sm font-semibold text-primary">L’ESSENTIEL DE VOTRE ÉCOLE</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">De la salle de classe à la gestion de l’établissement</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">Une place pour chaque activité, sans perdre vos outils de notes et de bulletins.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(f => <article key={f.title} className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="grid size-11 place-items-center rounded-md bg-primary-soft text-primary"><f.icon className="size-5" /></div>
            <h3 className="mt-5 text-xl font-semibold">{f.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div><p className="text-sm font-semibold text-primary">UNE ANNÉE SCOLAIRE BIEN SUIVIE</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Le quotidien de votre école, au même endroit</h2><p className="mt-5 text-muted-foreground leading-relaxed">De l’inscription au bulletin annuel, retrouvez les informations utiles à chaque moment de l’année scolaire.</p></div>
        <ul className="divide-y divide-border">
          {[{ icon: Wallet, title: "À l’inscription", text: "Ajoutez les élèves et définissez les frais de leur classe." }, { icon: CalendarDays, title: "Tout au long de la semaine", text: "Consultez les cours et consignez les absences et les retards." }, { icon: FileText, title: "À chaque fin de trimestre", text: "Complétez les deux séquences et générez les bulletins." }].map(item => <li key={item.title} className="flex gap-4 py-5 first:pt-0 last:pb-0"><item.icon className="mt-1 size-5 shrink-0 text-primary" /><div><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p></div></li>)}
        </ul>
      </div>
    </section>

    <section id="etapes" className="scroll-mt-28">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Bien démarrer avec CampusManager</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map((s, i) => <div key={s.title} className="border-t border-border pt-6"><span className="font-serif text-3xl font-bold text-primary">0{i + 1}</span><h3 className="mt-4 text-xl font-semibold">{s.title}</h3><p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p></div>)}</div>
      </div>
    </section>

    <section id="faq" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-16"><h2 className="text-3xl font-bold md:text-4xl">Questions fréquentes</h2><div className="mt-8">{faqs.map(f => <FaqItem key={f.q} {...f} />)}</div></div>
    </section>

    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 text-center lg:px-8"><ShieldCheck className="mx-auto size-9 text-gold" /><h2 className="mt-4 text-3xl font-bold md:text-4xl">Votre école mérite une gestion organisée</h2><p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">Retrouvez vos élèves, vos finances et vos activités scolaires dans CampusManager.</p><Button size="lg" variant="secondary" asChild className="mt-7"><Link to="/auth">Commencer maintenant<ArrowRight className="size-4" /></Link></Button></div>
    </section>

    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="grid gap-8 md:grid-cols-3"><div><Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary"><GraduationCap className="size-6" />CampusManager</Link><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">La gestion de votre établissement scolaire : élèves, finances, vie scolaire, emplois du temps et bulletins.</p></div><div><h3 className="font-semibold">Découvrir</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><a href="#fonctionnalites">Les rubriques</a></li><li><a href="#etapes">Bien démarrer</a></li><li><a href="#faq">Questions fréquentes</a></li></ul></div><div><h3 className="font-semibold">Votre espace</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><Link to="/auth">Se connecter</Link></li><li><Link to="/auth">Créer un compte</Link></li><li>Écoles, collèges et lycées</li></ul></div></div><p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">© {new Date().getFullYear()} CampusManager. Tous droits réservés.</p></div>
    </footer>
  </div>;
}
