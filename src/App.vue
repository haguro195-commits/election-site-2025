<template>
  <div id="app">
    <header class="header">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>衆議院選挙2025</h1>
        </div>
        <ul class="nav-menu">
          <li><router-link to="/">ホーム</router-link></li>
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
      <p>&copy; 2025 衆議院選挙情報サイト</p>
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
  text-align: center;
  padding: 1rem;
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