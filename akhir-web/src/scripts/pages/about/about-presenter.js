class AboutPresenter {
  #container;

  constructor({ viewContainer }) {
    this.#container = viewContainer;
  }

  init() {
    this.#renderAboutInfo();
  }

  #renderAboutInfo() {
    const developerInfo = {
      name: "Rifqi Alawi Zulfa",
      email: "rifqigame04@gmail.com",
      linkedin: "https://www.linkedin.com/in/alawi-zulfa-3abbb7306/",
      appVersion: "1.0.0",
      pesan:
        "Mereka yang dapat memaafkan diri mereka sendiri, dan bisa menerima sifat sejati tersebut adalah mereka yang kuat",
    };

    this.#container.innerHTML = `
      <p>Tentang Saya.</p>
      <ul>
        <li><strong>Developer:</strong> ${developerInfo.name}</li>
        <li><strong>Email:</strong> <a href="mailto:${developerInfo.email}">${developerInfo.email}</a></li>
        <li><strong>LinkedIn:</strong> <a href="${developerInfo.linkedin}" target="_blank">${developerInfo.linkedin}</a></li>
        <li><strong>Versi Aplikasi:</strong> ${developerInfo.appVersion}</li>
        <li><strong>Message:</strong> ${developerInfo.pesan}</li>
      </ul>
      <p> -Iticahi Uchiha
    `;
  }
}

export default AboutPresenter;
