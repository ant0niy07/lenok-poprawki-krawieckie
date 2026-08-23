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
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  buildRequestMessage,
  calculateExpressRange,
  calculateTotal,
  formatPrice,
  garments,
  getAvailableServices,
  getServiceCost,
  getServiceDisplay,
  getServicePrice,
  getServiceUnit,
  type GarmentType,
  type ServiceId,
} from "./data/estimatedPricing";
import {
  AnimatedServiceCard,
  AtelierHeroScene,
  ContinuousThread,
  FabricFoldTransition,
  GarmentVisualizer,
  MagneticActionButton,
  MotionReveal,
  ReducedMotionFallback,
  TailoringProcessTimeline,
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
        <a onClick={() => setOpen(false)} href="#price-list">
          {t("nav.priceList")}
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
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <motion.h1
          className="fabric-reveal"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0)" }}
          transition={{ delay: 1.15, duration: 0.7 }}
        >
          {t("hero.title")}
        </motion.h1>
        <p className="lead">{t("hero.text")}</p>
        <motion.div
          className="actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.65, duration: 0.45 }}
        >
          <a className="button" href="#calculator">
            <MagneticActionButton className="button-inner">
              {t("hero.cta")}
              <ArrowRight />
            </MagneticActionButton>
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
        </motion.div>
        <div className="trust">
          <strong>{t("hero.rating")}</strong>
          <span>{t("hero.reviews")}</span>
          <span>Narbutta 11/2a</span>
          <span>Mokotów</span>
        </div>
      </motion.div>
      <AtelierHeroScene photoAlt={t("media.hero")} />
    </section>
  );
}
function PriceList() {
  const { t, i18n } = useTranslation();
  return (
    <section className="price-list" id="price-list" aria-labelledby="price-list-title">
      <div className="section-head">
        <p className="eyebrow">LENOK / PLN</p>
        <h2 id="price-list-title">{t("priceList.title")}</h2>
        <p>{t("priceList.intro")}</p>
      </div>
      <div className="price-groups">
        {garments.map((garment) => (
          <MotionReveal className="price-group" key={garment}>
            <h3>{t(`garments.${garment}`)}</h3>
            <dl>
              {getAvailableServices(garment).map((service) => (
                <div key={service}>
                  <dt>{t(`services.${service}`)}</dt>
                  <dd>{getServiceDisplay(garment, service, i18n.language)}</dd>
                </div>
              ))}
            </dl>
            {garment === "dress" && <p className="price-note">{t("priceList.dressNote")}</p>}
          </MotionReveal>
        ))}
      </div>
      <p className="price-notice">{t("calc.notice")}</p>
    </section>
  );
}
function Calculator() {
  const { t, i18n } = useTranslation();
  const [garment, setGarment] = useState<GarmentType | null>(null),
    [selected, setSelected] = useState<ServiceId[]>([]),
    [quantities, setQuantities] = useState<Partial<Record<ServiceId, number>>>({}),
    [express, setExpress] = useState(false),
    [manual, setManual] = useState("");
  const available = getAvailableServices(garment);
  const total = calculateTotal(garment, selected, quantities);
  const expressRange = calculateExpressRange(total);
  const hasIndividual = selected.some((s) => getServicePrice(garment, s) === null);
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
    const nextAvailable = getAvailableServices(g);
    const valid = selected.filter((s) => nextAvailable.includes(s));
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
        display: getServiceDisplay(garment, s, i18n.language),
        cost: getServiceCost(garment, s, quantities[s]),
        quantity: quantities[s],
        unit: getServiceUnit(garment, s),
      })),
      total,
      express,
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
        {garments.map((g, index) => (
          <motion.button
            key={g}
            className={garment === g ? "garment-card selected" : "garment-card"}
            onClick={() => selectGarment(g)}
            aria-pressed={garment === g}
            animate={{
              opacity: garment && garment !== g ? 0.5 : 1,
              scale: garment === g ? 1.035 : garment ? 0.97 : 1,
              y: garment === g ? -8 : 0,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ rotate: index % 2 ? 0.7 : -0.7, y: -5 }}
            transition={{ delay: index * 0.07, type: "spring", damping: 18 }}
          >
            <GarmentVisualizer garment={g} label={t(`garments.${g}`)} />
            <span>{t(`garments.${g}`)}</span>
            {garment === g && <Check />}
          </motion.button>
        ))}
      </div>
      {garment && (
        <div className="calc-layout">
          <div>
            <h3>{t("services.title")}</h3>
            <div className="service-list">
              {available.map((s) => {
                return (
                  <AnimatedServiceCard
                    key={s}
                    disabled={false}
                    onClick={() => toggle(s)}
                    selected={selected.includes(s)}
                  >
                    <span className="check">
                      <AnimatePresence>
                        {selected.includes(s) && (
                          <motion.span
                            initial={{ scale: 0, rotate: -35 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                          >
                            <Check />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span>
                      <strong>{t(`services.${s}`)}</strong>
                      <small>
                        {getServiceDisplay(garment, s, i18n.language)}
                      </small>
                    </span>
                  </AnimatedServiceCard>
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
              <motion.ul layout>
                <AnimatePresence initial={false}>
                  {selected.map((s) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: 18, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: -18, height: 0 }}
                      layout
                    >
                      <span className="selected-service-name">
                        {t(`services.${s}`)}
                        <small>{getServiceDisplay(garment, s, i18n.language)}</small>
                      </span>
                      <strong>
                        {getServicePrice(garment, s) === null
                          ? t("calc.individual")
                          : `${t("calc.calculated")}: ${formatPrice(getServiceCost(garment, s, quantities[s]), i18n.language)}`}
                      </strong>
                      {getServiceUnit(garment, s) && (
                        <label className="quantity">
                          <span>{getServiceUnit(garment, s) === "hours" ? t("calc.hours") : t("calc.metres")}</span>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={quantities[s] ?? 1}
                            onChange={(event) =>
                              setQuantities((current) => ({
                                ...current,
                                [s]: Math.max(0.5, Number(event.target.value) || 1),
                              }))
                            }
                          />
                        </label>
                      )}
                      <button
                        aria-label={`Remove ${t(`services.${s}`)}`}
                        onClick={() => toggle(s)}
                      >
                        <X />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
            <div className="total">
              <span>{t("calc.subtotal")}</span>
              <motion.strong
                key={total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                aria-live="polite"
              >
                {formatPrice(total, i18n.language)}
              </motion.strong>
            </div>
            {hasIndividual && <p className="individual-note">{t("calc.individual")}</p>}
            <label className="express-toggle">
              <input type="checkbox" checked={express} onChange={(event) => setExpress(event.target.checked)} />
              <span>{t("calc.express")}</span>
            </label>
            {express && total > 0 && (
              <motion.div className="express-total" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
                <span>{t("calc.expressRange")}</span>
                <strong>{formatPrice(expressRange.minimum, i18n.language)} – {formatPrice(expressRange.maximum, i18n.language)}</strong>
              </motion.div>
            )}
            <p className="disclaimer">{t("calc.notice")}</p>
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
              <motion.button
                className="button full"
                type="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: selected.length ? 1 : 0.55, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("calc.send")}
                <ArrowRight />
              </motion.button>
            </form>
            {manual && (
              <div className="manual">
                <textarea readOnly value={manual} />
                <button
                  className="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(manual);
                      toast.success(t("toast.copied"));
                    } catch {
                      toast.error(t("toast.failed"));
                    }
                  }}
                >
                  <Copy />
                  {i18n.language === "pl"
                    ? "Kopiuj"
                    : i18n.language === "ru"
                      ? "Копировать"
                      : "Copy"}
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
      <ReducedMotionFallback>
        <main id="main">
          <ContinuousThread />
          <Hero />
          <PriceList />
          <Calculator />
          <FabricFoldTransition />
          <section className="atelier" id="services">
            <div className="atelier-chalk" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <MotionReveal className="atelier-copy">
              <p className="eyebrow">{t("atelier.kicker")}</p>
              <h2>{t("atelier.title")}</h2>
              <p>{t("atelier.text")}</p>
            </MotionReveal>
            <motion.div
              className="atelier-mannequin"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 45 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mannequin-neck" />
              <GarmentVisualizer
                garment="blazer"
            services={["blazerWaist", "blazerSleeves", "blazerLining"]}
              />
              <div className="mannequin-stand" />
            </motion.div>
          </section>
          <TailoringProcessTimeline
            steps={steps}
            note={t("process.note")}
            title={t("process.title")}
            photoAlt={t("media.process")}
          />
          <section className="real-media" aria-labelledby="about-master">
            <MotionReveal className="media-about">
              <picture>
                <source srcSet="/media/lenok/about-photo.webp" type="image/webp" />
                <img src="/media/lenok/about-photo.jpg" width="1400" height="933" loading="lazy" alt={t("media.portrait")} />
              </picture>
              <div>
                <p className="eyebrow">LENOK / MOKOTÓW</p>
                <h2 id="about-master">{t("media.aboutTitle")}</h2>
                <p>{t("media.aboutText")}</p>
              </div>
            </MotionReveal>
            <div className="editorial-gallery" aria-label={t("media.gallery")}>
              {["gallery-01", "gallery-02", "gallery-03", "brand-detail"].map((name, index) => (
                <motion.picture key={name} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                  <source srcSet={`/media/lenok/${name}.webp`} type="image/webp" />
                  <img src={`/media/lenok/${name}.jpg`} width="1100" height={name === "brand-detail" ? 1100 : 1500} loading="lazy" alt={`${t("media.gallery")} ${index + 1}`} />
                </motion.picture>
              ))}
            </div>
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
          <motion.section
            className="contact"
            id="contact"
            initial={{ opacity: 0.65 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
          >
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
            <svg className="final-knot" viewBox="0 0 120 80" aria-hidden="true">
              <motion.path
                d="M4 44C33 8 84 74 56 43C38 23 80 15 91 43C99 64 74 67 70 49C67 34 103 27 116 42"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              />
            </svg>
          </motion.section>
        </main>
      </ReducedMotionFallback>
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
