export default class NotFoundPage {
  async render() {
    return `
      <section style="padding: 2rem; text-align: center;">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
        <a href="#/">Kembali ke Beranda</a>
      </section>
    `;
  }

  async afterRender() {}
}
