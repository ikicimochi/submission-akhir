import AboutPresenter from "./about-presenter";

import "../../../styles/about.css";

const AboutPage = {
  async render() {
    return `
    <section id="about-page" class="about-container">
      <div class="about-card">
        <h2 class="title">Tentang Aplikasi</h2>
        <div id="about-content">
          <p>Loading informasi...</p>
        </div>
        <div class="about-image-wrapper">
          <img src="/images/piece.png" alt="piece" class="about-image" />
        </div>
      </div>
    </section>
  `;
  },

  async afterRender() {
    const container = document.querySelector(".about-container");
    if (container) {
      container.classList.add("fade-in");
    }

    const aboutContent = document.querySelector("#about-content");
    const presenter = new AboutPresenter({ viewContainer: aboutContent });
    presenter.init();
  },
};

export default AboutPage;
