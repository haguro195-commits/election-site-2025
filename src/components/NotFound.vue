<template>
  <div class="not-found">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">ページが見つかりません</h2>
      <p class="error-message">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">
          🏠 ホームに戻る
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          ← 前のページに戻る
        </button>
      </div>
      
      <div class="helpful-links">
        <h3>お探しの情報はこちらから</h3>
        <div class="link-grid">
          <router-link to="/" class="help-link">
            <span class="icon">📰</span>
            <span>最新ニュース</span>
          </router-link>
          <router-link to="/map" class="help-link">
            <span class="icon">🗾</span>
            <span>選挙区マップ</span>
          </router-link>
          <router-link to="/prediction" class="help-link">
            <span class="icon">📊</span>
            <span>議席予測</span>
          </router-link>
          <router-link to="/favorites" class="help-link">
            <span class="icon">⭐</span>
            <span>お気に入り</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #3498db;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 1rem 0;
}

.error-message {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.helpful-links {
  margin-top: 3rem;
}

.helpful-links h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.help-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s;
}

.help-link:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  color: #2c3e50;
}

.help-link .icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.help-link span:last-child {
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .link-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>