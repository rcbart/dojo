/* Monoline icon set shared with the site (docs/home.html uses the same .ic
   convention). Streams keep declaring an emoji in `icon:` because that is the
   authoring shorthand; ico() maps it to a symbol at render time. Anything
   unmapped falls through to the emoji, so a new stream is never iconless. */
const ICON_MAP = {
  '🔑':'i-key','🔓':'i-lock','🔐':'i-lock','🔒':'i-lock','🪪':'i-badge','🎫':'i-ticket',
  '📜':'i-cert','🛡️':'i-shield','🛡':'i-shield','🔗':'i-link','🚨':'i-alert','🧩':'i-layers',
  '🍪':'i-clock','🏢':'i-columns','🏛️':'i-columns','🏛':'i-columns','☕':'i-coffee',
  '⚡':'i-cpu','🧵':'i-cpu','🧬':'i-dna','🧱':'i-layers','🧯':'i-bug','🐞':'i-bug',
  '🔍':'i-search','🔎':'i-terminal','⌨️':'i-keyboard','⌨':'i-keyboard','🔧':'i-wrench',
  '🌿':'i-branch','🌱':'i-branch','🌐':'i-globe','⚛️':'i-atom','⚛':'i-atom','🔌':'i-plug',
  '🍃':'i-leaf','🗄️':'i-database','🗄':'i-database','🚀':'i-rocket','🧰':'i-flask',
  '🔬':'i-flask','📦':'i-package','📚':'i-book','📖':'i-book','🔀':'i-cycle','🔁':'i-cycle',
  '⏳':'i-clock','⚙️':'i-gear','⚙':'i-gear','🟨':'i-code','🟩':'i-code','🔷':'i-code',
  '💠':'i-code','🗂️':'i-files','🗂':'i-files','🏠':'i-columns','🗺️':'i-layers','🗺':'i-layers',
  '🎯':'i-flask','📑':'i-book','🥷':'i-shield','🌍':'i-globe','🖥️':'i-terminal','💻':'i-terminal',
};
function ico(e, cls) {
  if (!e) return '';
  const id = ICON_MAP[e] || ICON_MAP[e.replace(/️/g, '')];
  return id ? `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#${id}"/></svg>` : e;
}
