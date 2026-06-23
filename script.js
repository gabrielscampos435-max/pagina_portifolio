(() => {
  const WHATSAPP_NUMBER = "5511989872321";
  const WHATSAPP_MESSAGE = "Ola! Vi seu portfolio de edicao e queria pedir um orcamento para um video.";

  const elements = {
    header: document.querySelector("[data-header]"),
    menuButton: document.querySelector(".menu-toggle"),
    navPanel: document.querySelector("[data-nav-panel]"),
    showreelLink: document.querySelector("[data-showreel-link]"),
    showreelContent: document.querySelector("[data-showreel-content]")
  };

  const navLinks = elements.navPanel ? [...elements.navPanel.querySelectorAll("a")] : [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isEmptyHref = (href = "") => {
    const value = href.trim();
    return !value || value === "#";
  };

  const getYoutubeId = (url = "") => {
    if (isEmptyHref(url)) return null;

    const normalizeId = (id) => (/^[A-Za-z0-9_-]{6,64}$/.test(id) ? id : null);

    try {
      const parsedUrl = new URL(url, window.location.href);
      const host = parsedUrl.hostname.replace(/^www\./, "");

      if (host === "youtu.be") {
        return normalizeId(parsedUrl.pathname.split("/").filter(Boolean)[0] || "");
      }

      if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
        const watchId = parsedUrl.searchParams.get("v");
        if (watchId) return normalizeId(watchId);

        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(pathParts[0])) {
          return normalizeId(pathParts[1] || "");
        }
      }
    } catch (error) {
      return null;
    }

    return null;
  };

  const buildYoutubeThumbnail = (id) => `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  const buildYoutubeEmbed = (id) => `https://www.youtube.com/embed/${encodeURIComponent(id)}`;

  const buildWhatsappUrl = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGE);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  const setDisabledLink = (link, label) => {
    link.textContent = label;
    link.dataset.disabled = "true";
    link.setAttribute("aria-disabled", "true");
    link.classList.add("is-disabled");
  };

  const setActiveExternalLink = (link, href, label) => {
    if (label) link.textContent = label;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.disabled = "false";
    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  };

  const renderWhatsappLinks = () => {
    const whatsappUrl = buildWhatsappUrl();

    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };

  const renderShowreel = () => {
    if (!elements.showreelLink || !elements.showreelContent) return;

    const href = elements.showreelLink.getAttribute("href") || "";
    const videoId = getYoutubeId(href);
    const playerBar = `
      <div class="player-bar">
        <span></span>
        <span></span>
        <span></span>
        <strong>Showreel Samuel Teixeira</strong>
      </div>
    `;

    if (videoId) {
      elements.showreelContent.innerHTML = `
        ${playerBar}
        <iframe
          class="showreel-media showreel-embed"
          src="${buildYoutubeEmbed(videoId)}"
          title="Showreel Samuel Teixeira"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy">
        </iframe>
      `;
      setActiveExternalLink(elements.showreelLink, href, "Assistir showreel");
      return;
    }

    setDisabledLink(elements.showreelLink, "Showreel em breve");
    elements.showreelContent.innerHTML = `
      ${playerBar}
      <div class="showreel-placeholder" role="img" aria-label="Espaco visual reservado para o showreel principal">
        <i class="fa-solid fa-play" aria-hidden="true"></i>
        <div>
          <strong>Showreel em preparacao</strong>
          <span>Area reservada para o video principal do portfolio.</span>
        </div>
      </div>
    `;
  };

  const renderVideoCard = (card) => {
    const link = card.querySelector("[data-video-link]");
    const thumb = card.querySelector("[data-video-thumb]");
    if (!link || !thumb) return;

    const href = link.getAttribute("href") || "";
    const videoId = getYoutubeId(href);
    const tag = card.querySelector(".tag")?.textContent?.trim() || "YouTube";
    const title = card.querySelector("h3")?.textContent?.trim() || "Video";

    thumb.innerHTML = "";
    thumb.classList.toggle("has-video", Boolean(videoId));
    card.classList.toggle("has-video", Boolean(videoId));

    if (videoId) {
      const image = document.createElement("img");
      image.src = buildYoutubeThumbnail(videoId);
      image.alt = `Thumbnail de ${title}`;
      image.loading = "lazy";
      thumb.append(image);

      const thumbTag = document.createElement("span");
      thumbTag.className = "thumb-tag";
      thumbTag.textContent = tag;
      thumb.append(thumbTag);

      thumb.setAttribute("aria-label", `Thumbnail do video ${title}`);
      setActiveExternalLink(link, href, "Assistir vídeo");
      return;
    }

    thumb.innerHTML = `
      <div class="thumb-placeholder">
        <span class="thumb-tag">${tag}</span>
        <i class="fa-solid fa-clapperboard" aria-hidden="true"></i>
      </div>
    `;
    thumb.setAttribute("aria-label", "Espaco visual para video em breve");
    setDisabledLink(link, "Vídeo em breve");
  };

  const renderVideos = () => {
    document.querySelectorAll("[data-video-card]").forEach(renderVideoCard);
  };

  const renderSocialLinks = () => {
    document.querySelectorAll("[data-social-link]").forEach((link) => {
      const href = link.getAttribute("href") || "";

      if (isEmptyHref(href)) {
        link.dataset.disabled = "true";
        link.setAttribute("aria-disabled", "true");
        link.classList.add("is-disabled");
        return;
      }

      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.disabled = "false";
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
    });
  };

  const blockDisabledLinks = () => {
    document.addEventListener("click", (event) => {
      const disabledLink = event.target.closest("a[data-disabled='true']");
      if (disabledLink) event.preventDefault();
    });
  };

  const setMenuState = (isOpen) => {
    if (!elements.menuButton || !elements.navPanel) return;

    elements.menuButton.classList.toggle("is-open", isOpen);
    elements.navPanel.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    elements.menuButton.setAttribute("aria-expanded", String(isOpen));
    elements.menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  };

  const bindMenu = () => {
    elements.menuButton?.addEventListener("click", () => {
      const isOpen = elements.menuButton.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuState(false);
    });

    document.addEventListener("click", (event) => {
      if (!elements.navPanel || !elements.menuButton || !elements.navPanel.classList.contains("is-open")) return;

      const clickedInsideMenu = elements.navPanel.contains(event.target);
      const clickedButton = elements.menuButton.contains(event.target);
      if (!clickedInsideMenu && !clickedButton) setMenuState(false);
    });
  };

  const bindHeader = () => {
    const updateHeader = () => {
      elements.header?.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  };

  const bindActiveSections = () => {
    if (!("IntersectionObserver" in window)) return;

    const sections = [...document.querySelectorAll("main section[id]")];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeLink = navLinks.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
          navLinks.forEach((link) => link.classList.toggle("is-active", link === activeLink));
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  };

  const bindReveal = () => {
    const revealItems = [...document.querySelectorAll(".reveal")];

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  };

  const init = () => {
    renderWhatsappLinks();
    renderShowreel();
    renderVideos();
    renderSocialLinks();
    blockDisabledLinks();
    bindMenu();
    bindHeader();
    bindActiveSections();
    bindReveal();
  };

  init();
})();
