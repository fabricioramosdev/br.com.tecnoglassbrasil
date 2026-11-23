(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // TODO: preencher com o WhatsApp real da TecnoGlass (formato 55DDDNUMERO, só dígitos)
  const PHONE_NUMBER = "";
  const SALES_EMAIL = "comercial@tecnoglassbrasil.com.br";
  const DEFAULT_WHATSAPP_MESSAGE =
    "Olá, equipe TecnoGlass. Gostaria de solicitar uma avaliação técnica para uma solução em PRFV para meu projeto.";

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message || DEFAULT_WHATSAPP_MESSAGE)}`;
  }

  function buildMailtoUrl(data) {
    const subject = "Solicitação de avaliação técnica - Site TecnoGlass";
    const body = buildLeadMessage(data);
    return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  if (PHONE_NUMBER) {
    $$(`a[href^="https://wa.me/${PHONE_NUMBER}"]`).forEach((link) => {
      if (!link.href.includes("?text=")) {
        link.href = buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE);
      }
    });
  }

  function trackSiteEvent(payload) {
    const endpoint = "/api/click-log.php";
    const body = JSON.stringify({
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...payload
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {});
    } catch (_) {
      // O rastreamento nunca deve bloquear o clique do usuário.
    }
  }

  function trackContactClick(link) {
    trackSiteEvent({
      event: "contact_click",
      channel: link.getAttribute("data-track-channel") || "",
      person: link.getAttribute("data-track-person") || "",
      location: link.getAttribute("data-track-location") || "",
      href: link.getAttribute("href") || ""
    });
  }

  function trackFormSubmit(data) {
    trackSiteEvent({
      event: "form_submit",
      channel: "form",
      person: "Comercial",
      location: "formulario",
      model: data.model || "",
      state: data.state || "",
      city: data.city || ""
    });
  }

  $$("[data-track-click]").forEach((link) => {
    link.addEventListener("click", () => trackContactClick(link));
  });

  const header = $("[data-header]");
  const contactSection = $("#contato");
  function updateHeaderState() {
    if (!header) return;
    const hasScrolled = window.scrollY > 8;
    header.classList.toggle("is-scrolled", hasScrolled);
    document.body.classList.toggle("has-scrolled", window.scrollY > 260);
  }
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  if (contactSection && "IntersectionObserver" in window) {
    const contactObserver = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("in-contact", entry.isIntersecting);
      },
      { threshold: 0.12 }
    );
    contactObserver.observe(contactSection);
  }

  const navToggle = $("#navToggle");
  const siteNav = $("#siteNav");

  function closeNav() {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    $$("a", siteNav).forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("open")) return;
      if (siteNav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$(".section").forEach((section) => {
    $$(".reveal", section).forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${Math.min(index, 7) * 70}ms`);
    });
  });

  const heroRevealEls = $$(".hero .reveal");
  heroRevealEls.forEach((el) => el.classList.add("visible"));
  const revealEls = $$(".reveal").filter((el) => !el.closest(".hero"));

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  const modelSelect = $("#model");
  $$("[data-model-link]").forEach((link) => {
    link.addEventListener("click", () => {
      if (!modelSelect) return;
      const model = link.getAttribute("data-model-link") || "";
      const option = $$("option", modelSelect).find((item) => item.value === model);
      if (option) modelSelect.value = model;
    });
  });

  const sizeCatalogText = `
TJ 1.0	1,00	1,05	800	45K
TJ 0.8	1,00	1,30	1000	40K
TM 1.1	1,20	1,00	1100	50K
TN 1.0	1,15	1,00	1350	60K
TJ 1.5	1,00	2,00	1500	50K
TM 1.6	1,20	1,50	1600	70K
TJ 1.9	1,00	2,50	1900	80K
TD 2.0	1,60	1,05	2000	100K
TJ 1.5	1,00	2,60	2000	60K
TN 2.0	1,15	1,50	2000	80K
TM 2.2	1,20	2,00	2200	85K
TJ 2.3	1,00	3,00	2300	110K
TF 2.6	1,85	1,00	2600	100K
TJ 2.7	1,00	3,50	2700	129K
TN 2.7	1,15	2,00	2700	90K
TM 2.8	1,20	2,50	2800	95K
TA 3.0	2,00	1,05	3000	70K
TD 3.0	1,60	1,50	3000	130K
TJ 3.1	1,00	4,00	3100	155K
TM 3.3	1,20	3,00	3300	106K
TN 3.3	1,15	2,50	3300	120K
TM 3.9	1,20	3,50	3900	130K
TA 4.0	2,00	1,30	4000	90K
TD 4.0	1,60	2,00	4000	150K
TE 4.0	2,25	1,05	4000	90K
TN 4.0	1,15	3,00	4000	150K
TM 4.5	1,20	4,00	4500	150K
TN 4.7	1,15	3,50	4700	170K
TA 5.0	2,00	1,50	5000	120K
TB 5.0	2,50	1,05	5000	110K
TD 5.0	1,60	2,50	5000	170K
TF 5.0	1,85	1,85	5000	180K
TN 5.4	1,15	4,00	5400	190K
TA 6.0	2,00	2,00	6000	150K
TB 6.0	2,50	1,25	6000	130K
TD 6.0	1,60	3,00	6000	200K
TE 6.0	2,25	1,50	6000	120K
TH 6.0	2,75	1,05	6000	140K
TA 7.0	2,00	2,30	7000	180K
TC 7.0	3,00	1,05	7000	180K
TD 7.0	1,60	3,50	7000	230K
TB 7.3	2,50	1,50	7300	150K
TF 7.5	1,85	2,78	7500	220K
TA 8.0	2,00	2,60	8000	200K
TD 8.0	1,60	4,00	8000	260K
TE 8.0	2,25	2,00	8000	150K
TH 8.0	2,75	1,30	8000	180K
TG 8.5	3,30	1,05	8500	210K
TA 9.0	2,00	3,00	9000	220K
TC 9.0	3,00	1,30	9000	210K
TD 9.0	1,60	4,50	9000	290K
TH 9.0	2,75	1,53	9000	210K
TA 10	2,00	3,30	10000	250K
TB 10	2,50	2,05	10000	160K
TC 10	3,00	1,50	10000	240K
TD 10	1,60	5,00	10000	310K
TE 10	2,25	2,50	10000	180K
TF 10	1,85	3,70	10000	250K
TG 10	3,30	1,25	10000	250K
TI 10	3,60	1,00	10000	230K
TB 11	2,50	2,25	11000	200K
TA 12	2,00	4,00	12000	280K
TB 12	2,50	2,50	12000	250K
TD 12	1,60	6,00	12000	360K
TE 12	2,25	3,00	12000	200K
TH 12	2,75	2,05	12000	250K
TG 13	3,30	1,53	13000	280K
TI 13	3,60	1,30	13000	290K
TA 14	2,00	4,50	14000	300K
TC 14	3,00	2,05	14000	280K
TD 14	1,60	7,00	14000	430K
TE 14	2,25	3,50	14000	220K
TH 14	2,75	2,33	14000	280K
TA 15	2,00	5,00	15000	320K
TB 15	2,50	3,05	15000	280K
TF 15	1,85	5,55	15000	400K
TH 15	2,75	2,53	15000	320K
TI 15	3,60	1,50	15000	330K
TB 16	2,50	3,25	16000	320K
TC 16	3,00	2,30	16000	320K
TE 16	2,25	4,00	16000	250K
TA 17	2,00	5,50	17000	350K
TB 17	2,50	3,50	17000	380K
TC 17	3,00	2,50	17000	340K
TG 17	3,30	2,05	17000	330K
TA 18	2,00	6,00	18000	400K
TE 18	2,25	4,50	18000	280K
TH 18	2,75	3,05	18000	350K
TA 20	2,00	6,50	20000	450K
TB 20	2,50	4,05	20000	420K
TE 20	2,25	5,00	20000	300K
TF 20	1,85	7,40	20000	550K
TG 20	3,30	2,34	20000	400K
TI 20	3,60	2,00	20000	380K
TA 21	2,00	7,00	21000	500K
TC 21	3,00	3,05	21000	480K
TG 21	3,30	2,50	21000	450K
TH 21	2,75	3,33	21000	420K
TB 22	2,50	4,50	22000	450K
TE 22	2,25	5,50	22000	320K
TC 23	3,00	3,30	23000	510K
TI 23	3,60	2,30	23000	450K
TA 24	2,00	8,00	24000	600K
TE 24	2,25	6,00	24000	350K
TH 24	2,75	4,05	24000	480K
TB 25	2,50	5,05	25000	520K
TC 25	3,00	3,55	25000	560K
TI 25	3,60	2,50	25000	480K
TE 26	2,25	6,50	26000	400K
TG 26	3,30	3,05	26000	500K
TB 27	2,50	5,50	27000	550K
TH 27	2,75	4,53	27000	510K
TC 28	3,00	4,05	28000	600K
TE 28	2,25	7,00	28000	450K
TG 28	3,30	3,25	28000	560K
TB 30	2,50	6,05	30000	600K
TG 30	3,30	3,53	30000	600K
TH 30	2,75	5,05	30000	540K
TI 30	3,60	3,00	30000	540K
TB 32	2,50	6,50	32000	620K
TC 32	3,00	4,55	32000	630K
TE 30	2,25	8,00	32000	500K
TH 33	2,75	5,53	33000	580K
TI 33	3,60	3,30	33000	580K
TB 35	2,50	7,00	35000	650K
TC 35	3,00	5,05	35000	750K
TG 35	3,30	4,10	35000	680K
TI 35	3,60	3,50	35000	620K
TH 36	2,75	6,05	36000	650K
TG 38.5	3,30	4,55	38500	750K
TC 39	3,00	5,55	39000	800K
TH 39	2,75	6,53	39000	700K
TB 40	2,50	8,00	40000	700K
TI 40	3,60	4,00	40000	700K
TH 42	2,75	7,05	42000	730K
TC 43	3,00	6,05	43000	850K
TG 43	3,30	5,05	43000	850K
TI 45	3,60	4,50	45000	780K
TG 47	3,30	5,50	47000	980K
TH 48	2,75	8,05	48000	850K
TI 50	3,60	5,00	50000	890K
TG 52	3,30	6,10	52000	1120K
TG 55	3,30	6,50	55000	1250K
TI 55	3,60	5,50	55000	1100K
TG 60	3,30	7,00	60000	1400K
TI 60	3,60	6,00	60000	1200K
TI 65	3,60	6,50	65000	1400K
TG 68.5	3,30	8,00	68500	1750K
TI 70	3,60	7,00	70000	1600K
TI 80	3,60	8,00	80000	1750K
TI 90	3,60	9,00	90000	1950K
TI 100	3,60	10,00	100000	2200K
`.trim();

  function parseCatalogDecimal(value) {
    const text = String(value || "").trim().replace(/\s/g, "");
    if (!text) return NaN;
    const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
  }

  function parseCatalogLiters(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return NaN;
    const number = Number(digits);
    return Number.isFinite(number) ? number : NaN;
  }

  const sizeCatalog = sizeCatalogText
    .split(/\r?\n/)
    .map((line) => {
      const [modelo, diametro, altura, litros, peso] = line.split("\t").map((item) => item.trim());
      return {
        modelo,
        diametro: parseCatalogDecimal(diametro),
        altura: parseCatalogDecimal(altura),
        litros: parseCatalogLiters(litros),
        peso: peso || "-"
      };
    })
    .filter(
      (item) =>
        item.modelo &&
        Number.isFinite(item.diametro) &&
        Number.isFinite(item.altura) &&
        Number.isFinite(item.litros)
    )
    .sort((a, b) => a.litros - b.litros || a.diametro - b.diametro || a.altura - b.altura);

  function escapeHtml(value) {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return String(value).replace(/[&<>"']/g, (char) => chars[char]);
  }

  function formatDecimal(value, options = {}) {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2
    });
  }

  function formatLiters(value) {
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }

  function formatM3(liters) {
    return `${(liters / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} m³`;
  }

  const sizeTableBody = $("#sizeTableBody");
  const sizeTableCount = $("#sizeTableCount");

  if (sizeTableBody) {
    sizeTableBody.innerHTML = sizeCatalog
      .map(
        (item) => `
          <tr>
            <td data-label="Modelo">${escapeHtml(item.modelo)}</td>
            <td data-label="Capacidade">${formatM3(item.litros)}</td>
            <td data-label="Volume">${formatLiters(item.litros)} L</td>
            <td data-label="Diâmetro">${formatDecimal(item.diametro)} m</td>
            <td data-label="Altura">${formatDecimal(item.altura)} m</td>
            <td data-label="Peso">${escapeHtml(item.peso)}</td>
          </tr>
        `
      )
      .join("");
  }

  if (sizeTableCount) sizeTableCount.textContent = String(sizeCatalog.length);

  /* ------------------------------------------------------------
     Calculadora cilíndrica — calcula SOMENTE ao clicar em "Calcular"
     (ou ao pressionar Enter em um campo). Digitar nunca dispara conta.
     Regra: informe 2 medidas, o campo vazio é calculado.
     Se os 3 estiverem preenchidos e um deles foi calculado antes,
     ele é recalculado a partir dos outros dois.
     ------------------------------------------------------------ */
  const calcFields = {
    diametro: $("#calcDiametro"),
    altura: $("#calcAltura"),
    litros: $("#calcVolume")
  };
  const calcButton = $("#calcButton");
  const clearCalcButton = $("#clearCalcButton");
  const calcStatus = $("#calcStatus");
  const calcModelResult = $("#calcModelResult");
  const CALC_PROMPT = "Preencha duas informações para calcular a terceira.";
  const CALC_LABELS = { diametro: "Diâmetro", altura: "Altura", litros: "Volume" };
  const CALC_TOLERANCE = { diametro: 0.01, altura: 0.01, litros: 1 };
  const calcInputs = Object.values(calcFields).filter(Boolean);
  let calcAutoKey = null; // campo preenchido pela última conta

  function setCalcMessage(message, html = "", type = "") {
    if (calcStatus) {
      calcStatus.innerHTML = message;
      calcStatus.classList.toggle("is-error", type === "error");
    }
    if (calcModelResult) calcModelResult.innerHTML = html;
  }

  function readCalcField(key) {
    const el = calcFields[key];
    const raw = el ? el.value.trim() : "";
    if (!raw) return { empty: true, value: NaN };
    const value = key === "litros" ? parseCatalogLiters(raw) : parseCatalogDecimal(raw);
    return { empty: false, value };
  }

  function markCalcField(key, state) {
    const el = calcFields[key];
    const box = el && el.closest(".calc-field");
    if (!box) return;
    box.classList.toggle("is-calculated", state === "calculated");
    box.classList.toggle("has-error", state === "error");
    el.setAttribute("aria-invalid", state === "error" ? "true" : "false");
  }

  function resetCalcMarks() {
    Object.keys(calcFields).forEach((key) => markCalcField(key, ""));
  }

  function calcCatalogMatch(missing, known) {
    const pair = Object.keys(calcFields).filter((key) => key !== missing);
    return (
      sizeCatalog.find((entry) => pair.every((key) => Math.abs(entry[key] - known[key]) <= CALC_TOLERANCE[key])) ||
      null
    );
  }

  function runCalculator() {
    resetCalcMarks();
    const keys = Object.keys(calcFields);
    const read = {};
    keys.forEach((key) => (read[key] = readCalcField(key)));

    // 1) Valores digitados precisam ser números maiores que zero
    const invalid = keys.filter((key) => !read[key].empty && !(read[key].value > 0));
    if (invalid.length) {
      invalid.forEach((key) => markCalcField(key, "error"));
      setCalcMessage(
        `Valor inválido em <strong>${invalid.map((key) => CALC_LABELS[key]).join(", ")}</strong>. Use apenas números maiores que zero (ex.: 1,15).`,
        "",
        "error"
      );
      calcFields[invalid[0]].focus();
      return;
    }

    // 2) Descobre qual campo será calculado
    const filled = keys.filter((key) => !read[key].empty);
    let target = null;
    if (filled.length < 2) {
      setCalcMessage(CALC_PROMPT, "", "error");
      const firstEmpty = keys.find((key) => read[key].empty);
      if (firstEmpty) calcFields[firstEmpty].focus();
      return;
    }
    if (filled.length === 2) {
      target = keys.find((key) => read[key].empty);
    } else if (calcAutoKey && filled.includes(calcAutoKey)) {
      target = calcAutoKey; // recalcula o campo que foi calculado antes
    } else {
      setCalcMessage(
        "Os três campos estão preenchidos. Esvazie o que você quer calcular ou clique em <strong>Limpar</strong>.",
        "",
        "error"
      );
      return;
    }

    // 3) Conta (volume em litros; medidas em metros)
    const known = {};
    keys.forEach((key) => {
      if (key !== target) known[key] = read[key].value;
    });
    const area = (d) => Math.PI * (d / 2) ** 2;
    const result = { ...known };
    const item = calcCatalogMatch(target, known);

    if (item) {
      // medidas padrão de fábrica têm prioridade sobre a conta geométrica
      result[target] = item[target];
    } else if (target === "litros") {
      result.litros = area(known.diametro) * known.altura * 1000;
    } else if (target === "altura") {
      result.altura = known.litros / 1000 / area(known.diametro);
    } else {
      result.diametro = Math.sqrt((4 * (known.litros / 1000)) / (Math.PI * known.altura));
    }

    if (!Object.values(result).every((n) => Number.isFinite(n) && n > 0)) {
      setCalcMessage("Não foi possível calcular com esses valores. Confira as medidas e tente de novo.", "", "error");
      return;
    }

    // 4) Mostra o resultado no campo calculado
    calcFields.diametro.value = formatDecimal(result.diametro);
    calcFields.altura.value = formatDecimal(result.altura);
    calcFields.litros.value = formatLiters(Math.round(result.litros));
    calcAutoKey = target;
    markCalcField(target, "calculated");

    const fmt = {
      diametro: `${formatDecimal(result.diametro)} m`,
      altura: `${formatDecimal(result.altura)} m`,
      litros: `${formatLiters(Math.round(result.litros))} L`
    };
    const summary = `<strong>${CALC_LABELS[target]}: ${fmt[target]}</strong> — diâmetro ${fmt.diametro}, altura ${fmt.altura}, volume ${fmt.litros}.`;

    if (item) {
      setCalcMessage(
        summary,
        `<div class="calc-match">Modelo padrão encontrado: <strong>${escapeHtml(item.modelo)}</strong> (${formatM3(
          item.litros
        )} / ${formatLiters(item.litros)} L). Peso: ${escapeHtml(item.peso)}.</div>`
      );
    } else {
      setCalcMessage(
        summary,
        '<div class="calc-match warn"><strong>Modelo personalizado.</strong> Não há modelo padrão com essas medidas, mas fabricamos de acordo com o diâmetro, altura e necessidade do seu projeto. Cálculo geométrico aproximado.</div>'
      );
    }
  }

  function clearCalculator() {
    calcInputs.forEach((el) => (el.value = ""));
    calcAutoKey = null;
    resetCalcMarks();
    setCalcMessage(CALC_PROMPT);
    if (calcFields.diametro) calcFields.diametro.focus();
  }

  // Digitar apenas limpa avisos e a marca de "calculado"; nunca calcula.
  Object.entries(calcFields).forEach(([key, el]) => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (calcAutoKey === key) calcAutoKey = null;
      markCalcField(key, "");
    });
    el.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      runCalculator();
    });
  });

  calcButton?.addEventListener("click", runCalculator);
  clearCalcButton?.addEventListener("click", clearCalculator);


  const gallery = $("#gallery");
  const filterButtons = $$(".filter-btn");
  const modal = $("#modal");
  const modalImg = $("#modalImg");
  const modalTitle = $("#modalTitle");
  const modalClose = $("#modalClose");
  const modalPrev = $("#modalPrev");
  const modalNext = $("#modalNext");
  const modalBackdrop = $("[data-modal-close]");
  let projectButtons = [];
  let visibleProjects = [];
  let currentProjectIndex = 0;
  let lastFocusedElement = null;

  function syncVisibleProjects() {
    projectButtons = $$(".project-card", gallery);
    visibleProjects = projectButtons.filter((button) => !button.classList.contains("is-hidden"));
  }

  function setActiveFilter(filter) {
    if (!gallery) return;

    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === filter);
    });

    $$(".project-card", gallery).forEach((card) => {
      const shouldShow = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });

    syncVisibleProjects();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveFilter(button.dataset.filter || "todos"));
  });

  function updateModal() {
    const current = visibleProjects[currentProjectIndex];
    if (!current || !modalImg || !modalTitle) return;

    const img = $("img", current);
    const src = current.dataset.full || (img ? img.src : "");
    const title = current.dataset.title || (img ? img.alt : "Projeto TecnoGlass");

    modalImg.src = src;
    modalImg.alt = title;
    modalTitle.textContent = title;
  }

  function openModal(index) {
    if (!modal || !modalImg || !visibleProjects.length) return;
    currentProjectIndex = index;
    lastFocusedElement = document.activeElement;
    updateModal();
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (modalImg) modalImg.removeAttribute("src");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function showProject(direction) {
    if (!visibleProjects.length) return;
    currentProjectIndex = (currentProjectIndex + direction + visibleProjects.length) % visibleProjects.length;
    updateModal();
  }

  if (gallery && modal && modalImg && modalClose && modalPrev && modalNext) {
    syncVisibleProjects();

    gallery.addEventListener("click", (event) => {
      const card = event.target.closest(".project-card");
      if (!card) return;
      syncVisibleProjects();
      const index = visibleProjects.indexOf(card);
      if (index >= 0) openModal(index);
    });

    modalClose.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", closeModal);
    modalPrev.addEventListener("click", () => showProject(-1));
    modalNext.addEventListener("click", () => showProject(1));

    document.addEventListener("keydown", (event) => {
      if (modal.getAttribute("aria-hidden") !== "false") return;

      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showProject(-1);
      if (event.key === "ArrowRight") showProject(1);

      if (event.key === "Tab") {
        const focusable = $$(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          modal
        ).filter((el) => !el.hasAttribute("disabled"));

        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  const form = $("#contact-form");
  const statusEl = $("#form-status");
  const submitBtn = $("#submit-btn");
  const crmEndpointEl = $("#crmEndpoint");
  const emailFallback = $("#emailFallback");
  const phoneInput = $("#phone");

  function onlyDigits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function formatBrazilPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const positionFromEnd = phoneInput.value.length - phoneInput.selectionStart;
      phoneInput.value = formatBrazilPhone(phoneInput.value);
      const nextPosition = Math.max(0, phoneInput.value.length - positionFromEnd);
      phoneInput.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.classList.remove("ok", "err");
    if (type) statusEl.classList.add(type);
    statusEl.textContent = message || "";
  }

  function clearFieldErrors() {
    if (!form) return;
    $$("input, select, textarea", form).forEach((field) => {
      field.classList.remove("field-error");
      field.removeAttribute("aria-invalid");
    });
  }

  function markFieldError(field) {
    field.classList.add("field-error");
    field.setAttribute("aria-invalid", "true");
  }

  function validateForm() {
    if (!form) return false;
    clearFieldErrors();

    const requiredFields = $$("[required]", form);
    const invalid = [];

    requiredFields.forEach((field) => {
      if (!field.value.trim()) invalid.push(field);
    });

    const email = $("#email");
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      invalid.push(email);
    }

    const phone = $("#phone");
    if (phone && onlyDigits(phone.value).length < 10) {
      invalid.push(phone);
    }

    if (invalid.length) {
      invalid.forEach(markFieldError);
      invalid[0].focus();
      setStatus("err", "Revise os campos destacados antes de enviar.");
      return false;
    }

    return true;
  }

  function formDataToObject(fd) {
    return Object.fromEntries(Array.from(fd.entries()).map(([key, value]) => [key, String(value).trim()]));
  }

  function buildLeadMessage(data) {
    const stamp = new Date().toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });

    return [
      "Nova avaliação técnica pelo site TecnoGlass",
      `Data: ${stamp}`,
      "",
      `Nome: ${data.name || "-"}`,
      `Empresa: ${data.empresa || "-"}`,
      `E-mail: ${data.email || "-"}`,
      `WhatsApp/telefone: ${data.phone || "-"}`,
      `Estado: ${data.state || "-"}`,
      `Cidade: ${data.city || "-"}`,
      `Modelo de interesse: ${data.model || "-"}`,
      `Capacidade/volume: ${data.volume || "-"}`,
      `Aplicação: ${data.application || "-"}`,
      "",
      "Mensagem:",
      data.message || "-",
      "",
      "Enviado via site tecnoglassbrasil.com.br"
    ].join("\n");
  }

  function setSubmitLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    const label = $("span", submitBtn);
    if (label) label.textContent = isLoading ? "Enviando solicitação..." : "Enviar solicitação para o comercial";
  }

  if (form) {
    form.addEventListener("input", (event) => {
      const field = event.target;
      if (!field.matches("input, select, textarea")) return;
      field.classList.remove("field-error");
      field.removeAttribute("aria-invalid");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (emailFallback) {
        emailFallback.classList.add("hidden");
        emailFallback.removeAttribute("href");
      }

      if (!validateForm()) return;

      const endpoint = crmEndpointEl ? crmEndpointEl.value.trim() : "";
      if (!endpoint || !endpoint.includes("/exec")) {
        if (emailFallback) {
          emailFallback.href = buildMailtoUrl(formDataToObject(new FormData(form)));
          emailFallback.classList.remove("hidden");
        }
        setStatus("err", "O envio automático ainda não está ativo. Use o botão abaixo para enviar a solicitação por e-mail.");
        return;
      }

      const fd = new FormData(form);

      if ((fd.get("company") || "").toString().trim() !== "") {
        setStatus("ok", "Solicitação registrada.");
        form.reset();
        return;
      }

      fd.append("submittedAt", new Date().toISOString());
      const payload = formDataToObject(fd);
      const emailUrl = buildMailtoUrl(payload);

      setStatus("", "Enviando sua solicitação para a equipe comercial...");
      setSubmitLoading(true);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" }
        });

        const responseText = await response.text();
        let json = null;
        try {
          json = JSON.parse(responseText);
        } catch (_) {
          json = null;
        }

        if (!response.ok || !json || json.ok !== true) {
          const message = json && json.error ? json.error : responseText || "Não foi possível registrar no CRM.";
          throw new Error(message);
        }

        setStatus("ok", "Solicitação enviada. A equipe comercial da TecnoGlass retornará pelos dados informados.");
        trackFormSubmit(payload);

        form.reset();
      } catch (error) {
        setStatus(
          "err",
          "Não foi possível enviar pelo formulário agora. Use o botão abaixo para enviar a solicitação por e-mail."
        );
        if (emailFallback) {
          emailFallback.href = emailUrl;
          emailFallback.classList.remove("hidden");
        }
        console.error("Falha ao enviar formulário TecnoGlass:", error);
      } finally {
        setSubmitLoading(false);
      }
    });
  }
})();
