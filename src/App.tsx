import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  Menu,
  Phone,
  X,
  MapPin,
  MessageCircle,
  ArrowRight,
  Copy,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  buildRequestMessage,
  calculateTotal,
  estimatedPricing,
  formatPrice,
  garments,
  getAvailableServices,
  getServicePrice,
  services,
  type GarmentType,
  type ServiceId,
} from "./data/estimatedPricing";
import {
  ContinuousThread,
  FabricFoldTransition,
  GarmentVisualizer,
} from "./components/Visuals";
const PHONE = "+48 884 388 085",
  WA = "https://wa.me/48884388085",
  TG = "https://t.me/Ljolja8",
  MAP =
    "https://www.google.com/maps/search/?api=1&query=LenOK%20Poprawki%20krawieckie%20Ludwika%20Narbutta%2011%2F2a%20Warszawa";
const langs = ["pl", "en", "ru"] as const;
type Lang = (typeof langs)[number];
function Flag({ lng }: { lng: Lang }) {
  return (
    <svg className="flag" viewBox="0 0 24 16" aria-hidden="true">
      {lng === "pl" ? (
        <>
          <rect width="24" height="8" fill="#fff" />
          <rect y="8" width="24" height="8" fill="#dc143c" />
        </>
      ) : lng === "ru" ? (
        <>
          <rect width="24" height="5.34" fill="#fff" />
          <rect y="5.33" width="24" height="5.34" fill="#164194" />
          <rect y="10.66" width="24" height="5.34" fill="#d52b1e" />
        </>
      ) : (
        <>
          <rect width="24" height="16" fill="#21468b" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#cf142b" strokeWidth="1.8" />
          <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
          <path d="M12 0v16M0 8h24" stroke="#cf142b" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
function LanguageSwitcher({ close }: { close?: () => void }) {
  const { i18n, t } = useTranslation();
  const nav = useNavigate(),
    loc = useLocation();
  const change = (lng: Lang) => {
    localStorage.setItem("lenok-language", lng);
    void i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    const parts = loc.pathname.split("/");
    parts[1] = lng;
    nav(parts.join("/") || `/${lng}`);
    close?.();
  };
  return (
    <div className="languages" aria-label={t("a11y.language")} role="group">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          className={i18n.language === l ? "active" : ""}
          aria-pressed={i18n.language === l}
          aria-label={`${t("a11y.language")}: ${l.toUpperCase()}`}
        >
          <Flag lng={l} />
          <span>{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <header>
      <a className="wordmark" href="#top">
        Len<span>OK</span>
      </a>
      <button
        className="menu"
        aria-label={open ? t("a11y.close") : t("a11y.menu")}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "open" : ""} aria-label="Main">
        <a onClick={() => setOpen(false)} href="#services">
          {t("nav.services")}
        </a>
        <a onClick={() => setOpen(false)} href="#process">
          {t("nav.process")}
        </a>
        <a onClick={() => setOpen(false)} href="#contact">
          {t("nav.contact")}
        </a>
        <a className="phone" href="tel:+48884388085">
          <Phone size={16} />
          {PHONE}
        </a>
        <LanguageSwitcher close={() => setOpen(false)} />
        <a
          className="button small"
          href="#calculator"
          onClick={() => setOpen(false)}
        >
          {t("nav.estimate")}
        </a>
      </nav>
    </header>
  );
}
function Hero() {
  const { t } = useTranslation();
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1>{t("hero.title")}</h1>
        <p className="lead">{t("hero.text")}</p>
        <div className="actions">
          <a className="button" href="#calculator">
            {t("hero.cta")}
            <ArrowRight />
          </a>
          <a
            className="icon-link"
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            className="icon-link"
            href={TG}
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
        </div>
        <div className="trust">
          <strong>{t("hero.rating")}</strong>
          <span>{t("hero.reviews")}</span>
          <span>Narbutta 11/2a</span>
          <span>Mokotów</span>
        </div>
      </div>
      <div className="hero-art">
        <div className="pattern-label">LENOK / FORM 01</div>
        <GarmentVisualizer garment="dress" services={["shortening"]} />
        <svg className="hero-stitch" viewBox="0 0 400 400" aria-hidden="true">
          <motion.path
            d="M20 330 C110 300 40 80 210 55 S350 160 260 330"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.4 }}
          />
        </svg>
      </div>
    </section>
  );
}
function Calculator() {
  const { t, i18n } = useTranslation();
  const [garment, setGarment] = useState<GarmentType | null>(null),
    [selected, setSelected] = useState<ServiceId[]>([]),
    [manual, setManual] = useState("");
  const available = getAvailableServices(garment);
  const total = calculateTotal(garment, selected);
  const schema = z.object({
    name: z.string().min(2, t("calc.required")),
    phone: z.string().min(7, t("calc.invalidPhone")),
    date: z.string().min(1, t("calc.required")),
    notes: z.string().optional(),
    channel: z.enum(["whatsapp", "telegram"]),
  });
  type Form = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { channel: "whatsapp" },
  });
  const selectGarment = (g: GarmentType) => {
    const valid = selected.filter((s) => estimatedPricing[g][s] !== null);
    if (valid.length !== selected.length) toast.info(t("services.removed"));
    setSelected(valid);
    setGarment(g);
  };
  const toggle = (s: ServiceId) =>
    setSelected((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]));
  const onSubmit = async (d: Form) => {
    if (!garment || !selected.length) {
      toast.error(t("calc.choose"));
      return;
    }
    const msg = buildRequestMessage({
      lng: i18n.language,
      garment: t(`garments.${garment}`),
      items: selected.map((s) => ({
        name: t(`services.${s}`),
        price: getServicePrice(garment, s),
      })),
      total,
      date: d.date,
      name: d.name,
      phone: d.phone,
      notes: d.notes,
    });
    let copied = true;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      copied = false;
      setManual(msg);
    }
    if (!copied) toast.error(t("toast.failed"));
    else
      toast.success(
        d.channel === "telegram" ? t("toast.telegram") : t("toast.copied"),
      );
    window.open(
      d.channel === "whatsapp" ? `${WA}?text=${encodeURIComponent(msg)}` : TG,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <section className="calculator" id="calculator">
      <div className="section-head">
        <p className="eyebrow">THREAD / FIT / FORM</p>
        <h2>{t("garments.title")}</h2>
        <p>{t("garments.hint")}</p>
      </div>
      <div className="garment-grid">
        {garments.map((g) => (
          <button
            key={g}
            className={garment === g ? "garment-card selected" : "garment-card"}
            onClick={() => selectGarment(g)}
            aria-pressed={garment === g}
          >
            <GarmentVisualizer garment={g} />
            <span>{t(`garments.${g}`)}</span>
            {garment === g && <Check />}
          </button>
        ))}
      </div>
      {garment && (
        <div className="calc-layout">
          <div>
            <h3>{t("services.title")}</h3>
            <div className="service-list">
              {services.map((s) => {
                const price = getServicePrice(garment, s),
                  disabled = !available.includes(s);
                return (
                  <button
                    key={s}
                    role="checkbox"
                    aria-checked={selected.includes(s)}
                    disabled={disabled}
                    onClick={() => toggle(s)}
                    className={
                      selected.includes(s) ? "service selected" : "service"
                    }
                  >
                    <span className="check">
                      {selected.includes(s) && <Check />}
                    </span>
                    <span>
                      <strong>{t(`services.${s}`)}</strong>
                      <small>
                        {price === null
                          ? t("services.unavailable")
                          : `${t("calc.from")} ${formatPrice(price, i18n.language)}`}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <aside className="summary">
            <GarmentVisualizer garment={garment} services={selected} />
            <h3>{t("calc.title")}</h3>
            {!selected.length ? (
              <p>{t("calc.empty")}</p>
            ) : (
              <ul>
                {selected.map((s) => (
                  <li key={s}>
                    <span>{t(`services.${s}`)}</span>
                    <strong>
                      {formatPrice(
                        getServicePrice(garment, s) ?? 0,
                        i18n.language,
                      )}
                    </strong>
                    <button
                      aria-label={`Remove ${t(`services.${s}`)}`}
                      onClick={() => toggle(s)}
                    >
                      <X />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="total">
              <span>{t("calc.total")}</span>
              <motion.strong
                key={total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                aria-live="polite"
              >
                {t("calc.from")} {formatPrice(total, i18n.language)}
              </motion.strong>
            </div>
            <p className="disclaimer">{t("calc.disclaimer")}</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <label>
                {t("calc.name")}
                <input {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <em>{errors.name.message}</em>}
              </label>
              <label>
                {t("calc.phone")}
                <input
                  type="tel"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <em>{errors.phone.message}</em>}
              </label>
              <label>
                {t("calc.date")}
                <input
                  type="date"
                  {...register("date")}
                  aria-invalid={!!errors.date}
                />
                <small>{t("calc.dateHint")}</small>
                {errors.date && <em>{errors.date.message}</em>}
              </label>
              <label>
                {t("calc.notes")}
                <textarea {...register("notes")} />
              </label>
              <fieldset>
                <legend>{t("calc.channel")}</legend>
                <label className="radio">
                  <input
                    type="radio"
                    value="whatsapp"
                    {...register("channel")}
                  />
                  WhatsApp
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    value="telegram"
                    {...register("channel")}
                  />
                  Telegram
                </label>
              </fieldset>
              <button className="button full" type="submit">
                {t("calc.send")}
                <ArrowRight />
              </button>
            </form>
            {manual && (
              <div className="manual">
                <textarea readOnly value={manual} />
                <button
                  className="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(manual);
                    toast.success(t("toast.copied"));
                  }}
                >
                  <Copy />
                  Copy
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
function Home() {
  const { t } = useTranslation();
  const faqQ = t("faq.q", { returnObjects: true }) as string[],
    faqA = t("faq.a", { returnObjects: true }) as string[],
    steps = t("process.items", { returnObjects: true }) as string[];
  return (
    <>
      <a className="skip" href="#main">
        {t("a11y.skip")}
      </a>
      <Header />
      <main id="main">
        <ContinuousThread />
        <Hero />
        <Calculator />
        <FabricFoldTransition />
        <section className="atelier" id="services">
          <div>
            <p className="eyebrow">{t("atelier.kicker")}</p>
            <h2>{t("atelier.title")}</h2>
            <p>{t("atelier.text")}</p>
          </div>
          <GarmentVisualizer
            garment="blazer"
            services={[
              "waistAdjustment",
              "sleeveShortening",
              "liningReplacement",
            ]}
          />
        </section>
        <section className="process" id="process">
          <p className="eyebrow">PATTERN / PROCESS</p>
          <h2>{t("process.title")}</h2>
          <div className="steps">
            {steps.map((s, i) => (
              <article key={s}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
              </article>
            ))}
          </div>
          <p>{t("process.note")}</p>
        </section>
        <section className="second">
          <h2>{t("second.title")}</h2>
          <p>{t("second.text")}</p>
        </section>
        <section className="reviews">
          <div>
            <strong>4.9 ★</strong>
            <span>Google · {t("hero.reviews")}</span>
          </div>
          <a
            className="button ghost"
            href={MAP}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Maps
            <ArrowRight />
          </a>
        </section>
        <section className="faq">
          <h2>{t("faq.title")}</h2>
          <Accordion.Root type="single" collapsible>
            {faqQ.map((q, i) => (
              <Accordion.Item value={`q${i}`} key={q}>
                <Accordion.Trigger>
                  {q}
                  <span>+</span>
                </Accordion.Trigger>
                <Accordion.Content>{faqA[i]}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
        <section className="contact" id="contact">
          <div>
            <p className="eyebrow">NARBUTTA 11/2A</p>
            <h2>{t("contact.title")}</h2>
            <address>
              <strong>LenOK Poprawki krawieckie</strong>
              <span>{t("contact.address")}</span>
              <a href="tel:+48884388085">{PHONE}</a>
            </address>
            <div className="actions">
              <a
                className="button"
                href={MAP}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin />
                {t("contact.open")}
              </a>
              <a href={WA} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href={TG} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </div>
          </div>
          <iframe
            title={t("common.maps")}
            loading="lazy"
            src="https://www.google.com/maps?q=Ludwika%20Narbutta%2011%2F2a%20Warszawa&output=embed"
          />
        </section>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <footer>
      <a className="wordmark" href={`/${i18n.language}`}>
        Len<span>OK</span>
      </a>
      <p>
        ul. Ludwika Narbutta 11/2a · 02-567 Warszawa · Mokotów
        <br />
        <a href="tel:+48884388085">{PHONE}</a> ·{" "}
        <a href={WA} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>{" "}
        ·{" "}
        <a href={TG} target="_blank" rel="noopener noreferrer">
          @Ljolja8
        </a>{" "}
        ·{" "}
        <a href={MAP} target="_blank" rel="noopener noreferrer">
          Google Maps
        </a>
      </p>
      <LanguageSwitcher />
      <p>
        <a href={`/${i18n.language}/privacy`}>{t("footer.privacy")}</a> ·{" "}
        {t("footer.rights")}
      </p>
      <a
        className="credit"
        href="https://instagram.com/ant0niy07"
        target="_blank"
        rel="noopener noreferrer"
      >
        Designed &amp; Developed by @ant0niy07
      </a>
    </footer>
  );
}
function MobileBar() {
  const { t } = useTranslation();
  return (
    <nav className="mobile-bar" aria-label="Quick contact">
      <a href="tel:+48884388085">
        <Phone />
        {t("contact.call")}
      </a>
      <a href={WA} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        WhatsApp
      </a>
      <a href={TG} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        Telegram
      </a>
      <a href="#calculator">
        <ArrowRight />
        {t("hero.cta")}
      </a>
    </nav>
  );
}
function Privacy() {
  const { t, i18n } = useTranslation();
  return (
    <>
      <Header />
      <main className="privacy">
        <p className="eyebrow">LENOK.PL</p>
        <h1>{t("privacy.title")}</h1>
        <p>{t("privacy.text")}</p>
        <p>{t("privacy.missing")}</p>
        <a className="button" href={`/${i18n.language}`}>
          {t("privacy.back")}
        </a>
      </main>
      <Footer />
    </>
  );
}
function Localized() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const loc = useLocation();
  useEffect(() => {
    if (lang && langs.includes(lang as Lang)) {
      void i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      localStorage.setItem("lenok-language", lang);
      const titles = {
        pl: "LenOK — Poprawki krawieckie Warszawa Mokotów",
        en: "LenOK — Clothing alterations in Warsaw Mokotów",
        ru: "LenOK — Ремонт одежды в Варшаве, Мокотув",
      };
      document.title = titles[lang as Lang];
      document.querySelector('meta[name="description"]')?.remove();
      const m = document.createElement("meta");
      m.name = "description";
      m.content =
        lang === "pl"
          ? "Profesjonalne poprawki krawieckie LenOK na Mokotowie."
          : lang === "en"
            ? "Professional clothing alterations by LenOK in Mokotów."
            : "Профессиональный ремонт одежды LenOK в Мокотуве.";
      document.head.appendChild(m);
    }
  }, [lang, i18n]);
  return loc.pathname.endsWith("/privacy") ? <Privacy /> : <Home />;
}
export default function App() {
  const saved =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("lenok-language")
      : null;
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={`/${langs.includes(saved as Lang) ? saved : "pl"}`}
            replace
          />
        }
      />
      <Route path="/:lang" element={<Localized />} />
      <Route path="/:lang/privacy" element={<Localized />} />
      <Route path="*" element={<Navigate to="/pl" replace />} />
    </Routes>
  );
}
