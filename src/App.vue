<template>
  <div id="app">
    <header class="header">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>衆議院選挙2026</h1>
        </div>
        <ul class="nav-menu">
          <li><router-link to="/">ホーム</router-link></li>
          <li><router-link to="/candidates">候補者一覧</router-link></li>
          <li><router-link to="/map">選挙区マップ</router-link></li>
          <li><router-link to="/prediction">議席予測</router-link></li>
          <li><router-link to="/favorites">お気に入り</router-link></li>
        </ul>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <h3>衆議院選挙2026情報サイト</h3>
          <p>2026年2月実施予定の衆議院選挙に関する最新情報を提供</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>サイト情報</h4>
            <a href="#about">このサイトについて</a>
            <a href="#privacy">プライバシーポリシー</a>
            <a href="#terms">利用規約</a>
          </div>
          <div class="link-group">
            <h4>お問い合わせ</h4>
            <a href="#contact">お問い合わせ</a>
            <a href="#feedback">ご意見・ご要望</a>
            <a href="#report">不具合報告</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 衆議院選挙情報サイト - 最新の選挙情報をお届けします</p>
        <p class="disclaimer">※ 議席予測は統計的推定に基づくものであり、実際の選挙結果を保証するものではありません</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
  line-height: 1.6;
  color: #333;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-brand h1 {
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  background-color: #34495e;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
}

.footer {
  background: #34495e;
  color: white;
  padding: 2rem 0 1rem;
  margin-top: 3rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.footer-info h3 {
  margin-bottom: 0.5rem;
  color: #3498db;
}

.footer-info p {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.link-group h4 {
  margin-bottom: 1rem;
  color: #3498db;
  font-size: 1rem;
}

.link-group a {
  display: block;
  color: #bdc3c7;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.link-group a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #4a5f7a;
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

.footer-bottom p {
  margin-bottom: 0.5rem;
  color: #bdc3c7;
}

.disclaimer {
  font-size: 0.9rem;
  font-style: italic;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
}

.btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s;
}

.btn:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
</style>