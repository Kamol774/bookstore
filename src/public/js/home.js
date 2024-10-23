console.log("Home frontend javascript file");

function fitElementToParent(el, padding) {
  let timeout = null;

  function resize() {
    if (timeout) clearTimeout(timeout);
    anime.set(el, { scale: 1 });
    let pad = padding || 0;
    let parentEl = el.parentNode;
    let elOffsetWidth = el.offsetWidth - pad;
    let parentOffsetWidth = parentEl.offsetWidth;
    let ratio = parentOffsetWidth / elOffsetWidth;
    timeout = setTimeout(anime.set(el, { scale: ratio }), 10);
  }

  resize();
  window.addEventListener("resize", resize);
}

// *******************************************************
var elemets = document.querySelector("svg").children;

anime({
  targets: "line",
  translateX: [
    { value: 270, duration: 1000, easing: "easeOutSine" },
    { value: 0, duration: 1000, easing: "easeOutSine" },
  ],
  delay: anime.stagger(200, { grid: [16, 10], from: 7 }),
  loop: true,
});
