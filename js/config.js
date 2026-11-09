/* =====================================================================
   Edit this file to make the portfolio yours.
   Anything left as an empty string stays a visible, clearly-labelled
   placeholder — never a fake link, a fake screenshot, or a fake success.
   ===================================================================== */

window.SITE_CONFIG = {
  name: 'Muhammad Imran',
  brand: 'M. Imran',
  title: 'Full Stack Web Developer',
  location: 'Behal, Bhakkar, Pakistan',

  github: 'https://github.com/Imran-developer-12',

  /* ---- CONTACT ---- */
  email:'imran1stcit104@gmail.com',
  linkedin: 'https://www.linkedin.com/in/m-imran-dev-6b908b449',
  emailJs: {
    publicKey: 'CnXL296taH980pNNM',
    serviceId: 'imranali',
    templateId: 'template_qyn6yxp'
  },

  /* ---- IMAGES ----
     The ZIP includes an optimized transparent profile cutout and three
     real project previews. Change these paths to swap in your own assets.
     Leaving the local screenshot paths as-is keeps the bundled previews.
  */
  assets: {
    profile: 'assets/images/profile-cutout.webp',
    screenshots: {
      gct: 'assets/screenshots/gct.webp',
      nextgen: 'assets/screenshots/nextgen.webp',
      voice: 'assets/screenshots/voice.webp'
    }
  },

  /* ---- CONTACT FORM ----
     No backend is wired by default.
     ''            -> the form hands the message to the visitor's own email
                      client via mailto (requires `email` above to be set).
     'https://...' -> a Formspree / Web3Forms / your own endpoint that
                      accepts a JSON POST; the form then posts to it and
                      reports the real result.
  */
  formEndpoint: ''
};
