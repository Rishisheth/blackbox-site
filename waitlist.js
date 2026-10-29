// Waitlist form and the streak preview. No dependencies.
// window.BLACKBOX_API (config.js) is the API origin; when it is empty the waitlist
// isn't open yet, and the form says so instead of pretending to save anything.
(function () {
  "use strict";

  const DAYS_SHOWN = 14 * 7;
  // The sample record: a 12-day run ending today, then a sparse, uneven history.
  const RUN_DAYS = 12;
  const RUN_SHADES = 3; // run days cycle through shades 1–3
  const GAP_EVERY = 4; // every 4th earlier day is empty
  const HISTORY_SHADES = 5; // earlier days cycle through shades 0–4

  /** The sample shade for a day, counted back from today. */
  function sampleShade(daysAgo) {
    if (daysAgo < RUN_DAYS) return 1 + (daysAgo % RUN_SHADES);
    if (daysAgo % GAP_EVERY === 0) return 0;
    return daysAgo % HISTORY_SHADES;
  }

  /** Fill the "Keep the streak" preview with the sample record ending today. */
  function drawStreak() {
    const grid = document.querySelector(".grid");
    if (!grid) return;
    for (let daysAgo = DAYS_SHOWN - 1; daysAgo >= 0; daysAgo -= 1) {
      const box = document.createElement("i");
      box.dataset.l = String(sampleShade(daysAgo));
      if (daysAgo === 0) box.className = "today";
      grid.appendChild(box);
    }
  }

  /** Wire the form to POST /waitlist, or explain that it opens soon. */
  function wireWaitlist() {
    const form = document.querySelector(".waitlist-form");
    const note = document.querySelector(".waitlist-note");
    if (!form || !note) return;
    const api = (window.BLACKBOX_API || "").replace(/\/$/, "");
    if (!api) {
      form.hidden = true;
      note.textContent = "Early access opens soon.";
      return;
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.email.value.trim();
      if (!form.email.checkValidity()) {
        note.textContent = "Enter a work email address.";
        form.email.focus();
        return;
      }
      note.textContent = "Saving…";
      try {
        const response = await fetch(`${api}/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        note.textContent = response.ok
          ? "You're in. We'll email you when your spot opens."
          : "That didn't work. Try again in a minute.";
        if (response.ok) form.reset();
      } catch {
        note.textContent = "That didn't work. Try again in a minute.";
      }
    });
  }

  drawStreak();
  wireWaitlist();
})();
