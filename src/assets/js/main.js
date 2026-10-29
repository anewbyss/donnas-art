// Small enhancements: protections, gallery filters, image viewer, sharing, contact form.
(() => {
  // Stop other websites from showing this site inside a frame of their own.
  if (window.top !== window.self) window.top.location = window.self.location;

  // Discourage saving artwork: no right-click menu, dragging or long-press
  // saving on images. (Screenshots can't be blocked, but casual copying is.)
  const isArt = (el) => el instanceof HTMLImageElement;
  document.addEventListener("contextmenu", (e) => { if (isArt(e.target)) e.preventDefault(); });
  document.addEventListener("dragstart", (e) => { if (isArt(e.target)) e.preventDefault(); });

  // Gallery filters
  const grid = document.getElementById("gallery-grid");
  if (grid) {
    const chips = [...document.querySelectorAll("[data-filter]")];
    const availableOnly = document.getElementById("available-only");
    const empty = document.querySelector(".empty-note");
    const cards = [...grid.querySelectorAll(".plate")];
    let active = new URLSearchParams(location.search).get("filter") || "all";

    const apply = () => {
      let shown = 0;
      for (const card of cards) {
        const cats = card.dataset.categories.split(" ");
        const status = card.dataset.status;
        const ok =
          (active === "all" || cats.includes(active)) &&
          (!availableOnly.checked || status === "available" || status === "prints");
        card.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      }
      chips.forEach((c) => {
        const on = c.dataset.filter === active;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on);
      });
      empty.hidden = shown > 0;
      const url = new URL(location.href);
      active === "all" ? url.searchParams.delete("filter") : url.searchParams.set("filter", active);
      history.replaceState(null, "", url);
    };

    chips.forEach((c) => c.addEventListener("click", () => { active = c.dataset.filter; apply(); }));
    availableOnly.addEventListener("change", apply);
    apply();
  }

  // Full-screen image viewer
  const box = document.querySelector(".lightbox");
  const links = [...document.querySelectorAll("[data-lightbox]")];
  if (box && links.length) {
    const img = box.querySelector("img");
    let index = 0;
    const show = (i) => {
      index = (i + links.length) % links.length;
      img.src = links[index].href;
      img.alt = links[index].querySelector("img")?.alt || "";
    };
    const close = () => { box.hidden = true; document.body.style.overflow = ""; };
    box.classList.toggle("single", links.length < 2);
    links.forEach((a, i) => a.addEventListener("click", (e) => {
      e.preventDefault();
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      box.querySelector(".lb-close").focus();
    }));
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    box.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  // Sharing
  document.querySelectorAll(".share").forEach((el) => {
    const { shareUrl, shareTitle } = el.dataset;
    const native = el.querySelector(".js-native-share");
    if (navigator.share && native) {
      native.hidden = false;
      native.addEventListener("click", () => navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {}));
    }
    const copy = el.querySelector(".js-copy-link");
    copy?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copy.textContent = "Link copied!";
      } catch {
        prompt("Copy this link:", shareUrl);
      }
      setTimeout(() => (copy.textContent = "Copy link"), 2000);
    });
  });

  // Contact form
  const form = document.querySelector("form.letter");
  if (form) {
    const about = new URLSearchParams(location.search).get("about");
    if (about) {
      form.querySelector("#about-field").value = about;
      const topic = form.querySelector("select[name=topic]");
      if (/^Something like/.test(about) && topic.options[0]?.text.startsWith("Commission")) topic.selectedIndex = 0;
      else topic.value = "Buying a piece";
    }

    form.addEventListener("submit", async (e) => {
      const data = new FormData(form);
      e.preventDefault();
      if (data.get("_gotcha")) return; // filled in by a spam robot
      const done = (msg) => {
        form.querySelectorAll("label, button, .muted, .trap").forEach((n) => n.remove());
        const p = document.createElement("p");
        p.className = "form-status";
        p.textContent = msg;
        form.append(p);
      };

      // No form service set up: open the visitor's email app instead.
      if (form.dataset.mailto !== undefined) {
        const subject = `${data.get("topic")}${data.get("artwork") ? " — " + data.get("artwork") : ""}`;
        const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`;
        location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }

      try {
        const res = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        done("Your letter is on its way. I'll be in touch soon.");
      } catch {
        form.submit();
      }
    });
  }
})();
