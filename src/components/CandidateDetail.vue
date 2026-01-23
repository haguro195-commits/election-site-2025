<template>
  <div class="candidate-detail">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>候補者情報を取得中...</p>
    </div>

    <div v-else-if="candidate" class="candidate-profile">
      <!-- パンくずナビ -->
      <nav class="breadcrumb">
        <router-link to="/candidates">候補者一覧</router-link>
        <span class="separator">›</span>
        <span class="current">{{ candidate.name }}</span>
      </nav>

      <!-- 候補者基本情報 -->
      <div class="profile-header">
        <div class="profile-photo">
          <img 
            v-if="candidate.photoUrl" 
            :src="candidate.photoUrl" 
            :alt="candidate.name"
            @error="handleImageError"
          >
          <div v-else class="photo-placeholder">
            👤
          </div>
        </div>
        
        <div class="profile-info">
          <h1>{{ candidate.name }}</h1>
          <div class="basic-info">
            <span class="party" :style="{ color: getPartyColor(candidate.party) }">
              {{ candidate.party }}
            </span>
            <span class="age">{{ candidate.age }}歳</span>
            <span v-if="candidate.isIncumbent" class="incumbent-badge">現職</span>
          </div>
          <div class="district-info">
            <h2>{{ candidate.district }}</h2>
            <p>{{ candidate.prefecture }}</p>
          </div>
        </div>

        <div class="profile-actions">
          <button @click="toggleFavorite" class="btn btn-secondary">
            {{ isFavorite ? '★' : '☆' }} お気に入り
          </button>
          <button @click="shareCandidate" class="btn btn-secondary">
            📤 共有
          </button>
        </div>
      </div>

      <!-- 詳細情報セクション -->
      <div class="profile-sections">
        <!-- 経歴・学歴 -->
        <section class="profile-section">
          <h3>経歴・学歴</h3>
          <div class="background-details">
            <div v-if="candidate.education" class="detail-item">
              <h4>学歴</h4>
              <p>{{ candidate.education }}</p>
            </div>
            
            <div v-if="candidate.career" class="detail-item">
              <h4>主な経歴</h4>
              <p>{{ candidate.career }}</p>
            </div>
            
            <div v-if="candidate.experience" class="detail-item">
              <h4>政治経験</h4>
              <p>{{ candidate.experience }}</p>
            </div>
          </div>
        </section>

        <!-- 政策・公約 -->
        <section class="profile-section" v-if="candidate.policies && candidate.policies.length > 0">
          <h3>主要政策・公約</h3>
          <ul class="policies-list">
            <li v-for="policy in candidate.policies" :key="policy">
              {{ policy }}
            </li>
          </ul>
        </section>

        <!-- SNS・ウェブサイト -->
        <section class="profile-section" v-if="candidate.website || candidate.twitter">
          <h3>公式サイト・SNS</h3>
          <div class="external-links">
            <a v-if="candidate.website" :href="candidate.website" target="_blank" class="external-link">
              🌐 公式ウェブサイト
            </a>
            <a v-if="candidate.twitter" :href="getTwitterUrl(candidate.twitter)" target="_blank" class="external-link">
              🐦 Twitter
            </a>
          </div>
        </section>

        <!-- 選挙区情報 -->
        <section class="profile-section">
          <h3>選挙区情報</h3>
          <div class="district-details">
            <p><strong>選挙区:</strong> {{ candidate.district }}</p>
            <p><strong>都道府県:</strong> {{ candidate.prefecture }}</p>
            <router-link :to="`/map?district=${encodeURIComponent(candidate.district)}`" class="btn btn-secondary">
              選挙区マップで確認
            </router-link>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="error-message">
      <h2>候補者が見つかりません</h2>
      <p>指定された候補者の情報を取得できませんでした。</p>
      <router-link to="/candidates" class="btn btn-primary">候補者一覧に戻る</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'CandidateDetail',
  setup() {
    const route = useRoute()
    const candidate = ref(null)
    const loading = ref(false)
    const isFavorite = ref(false)

    const candidateId = computed(() => route.params.id)

    const fetchCandidate = async () => {
      loading.value = true
      try {
        const response = await axios.get('/.netlify/functions/fetch-candidates', {
          timeout: 30000
        })

        if (response.data.success) {
          // 全候補者から指定IDの候補者を検索
          let foundCandidate = null
          response.data.data.forEach(district => {
            district.candidates.forEach(c => {
              if (c.id.toString() === candidateId.value) {
                foundCandidate = {
                  ...c,
                  district: district.name,
                  prefecture: district.prefecture
                }
              }
            })
          })
          
          candidate.value = foundCandidate
        } else {
          throw new Error(response.data.error || '候補者データ取得に失敗')
        }
      } catch (error) {
        console.error('候補者データ取得エラー:', error)
        // フォールバック: サンプルデータから検索
        candidate.value = getSampleCandidate(candidateId.value)
      } finally {
        loading.value = false
      }
    }

    const getSampleCandidate = (id) => {
      const sampleCandidates = [
        {
          id: 101,
          name: '佐藤北海',
          party: '自民党',
          age: 52,
          district: '北海道1区',
          prefecture: '北海道',
          experience: '元道議会議員',
          education: '北海道大学法学部',
          career: '弁護士、道議会議員2期',
          policies: ['地域経済活性化', '農業支援', '観光振興', 'インフラ整備', '少子高齢化対策'],
          website: 'https://example.com/sato',
          twitter: '@sato_hokkai',
          isIncumbent: true,
          photoUrl: null
        },
        {
          id: 102,
          name: '田中雪子',
          party: '立憲民主党',
          age: 45,
          district: '北海道1区',
          prefecture: '北海道',
          experience: '元市議会議員',
          education: '早稲田大学政治経済学部',
          career: '市議会議員3期、NPO代表',
          policies: ['子育て支援', '環境保護', '格差是正', '女性活躍推進', '教育改革'],
          website: 'https://example.com/tanaka',
          twitter: '@tanaka_yukiko',
          isIncumbent: false,
          photoUrl: null
        }
      ]
      
      return sampleCandidates.find(c => c.id.toString() === id) || null
    }

    const getPartyColor = (partyName) => {
      const colors = {
        '自民党': '#FF6B6B',
        '立憲民主党': '#4ECDC4',
        '公明党': '#45B7D1',
        '国民民主党': '#BB8FCE',
        '共産党': '#EC7063',
        '日本維新の会': '#F7DC6F',
        'れいわ新選組': '#85C1E9',
        '参政党': '#F8C471'
      }
      return colors[partyName] || '#95A5A6'
    }

    const getTwitterUrl = (handle) => {
      const cleanHandle = handle.replace('@', '')
      return `https://twitter.com/${cleanHandle}`
    }

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
      // お気に入り機能の実装
      console.log('Toggle favorite:', candidate.value)
    }

    const shareCandidate = () => {
      if (navigator.share) {
        navigator.share({
          title: `${candidate.value.name}（${candidate.value.party}・${candidate.value.district}）`,
          text: `${candidate.value.name}候補者の詳細情報`,
          url: window.location.href
        })
      } else {
        const text = `${candidate.value.name}（${candidate.value.party}・${candidate.value.district}）\n${window.location.href}`
        navigator.clipboard.writeText(text)
        alert('候補者情報をクリップボードにコピーしました')
      }
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    onMounted(() => {
      fetchCandidate()
    })

    return {
      candidate,
      loading,
      isFavorite,
      getPartyColor,
      getTwitterUrl,
      toggleFavorite,
      shareCandidate,
      handleImageError
    }
  }
}
</script>

<style scoped>
.candidate-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.breadcrumb {
  margin-bottom: 2rem;
  color: #7f8c8d;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
}

.current {
  font-weight: bold;
  color: #2c3e50;
}

.profile-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: start;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 4rem;
  color: #bdc3c7;
}

.profile-info h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.basic-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.party {
  font-weight: bold;
  font-size: 1.2rem;
}

.age {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.incumbent-badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
}

.district-info h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.district-info p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-sections {
  display: grid;
  gap: 2rem;
}

.profile-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
}

.profile-section h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.background-details {
  display: grid;
  gap: 1.5rem;
}

.detail-item h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.detail-item p {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

.policies-list {
  list-style: none;
  padding: 0;
}

.policies-list li {
  background: #f8f9fa;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  font-size: 1rem;
  color: #2c3e50;
}

.external-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.external-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.external-link:hover {
  background: #2980b9;
}

.district-details p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #2c3e50;
}

.district-details .btn {
  margin-top: 1rem;
}

.error-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error-message h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-message p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .candidate-detail {
    padding: 1rem;
  }
  
  .profile-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-photo {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }
  
  .profile-info h1 {
    font-size: 2rem;
  }
  
  .basic-info {
    justify-content: center;
  }
  
  .profile-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .external-links {
    justify-content: center;
  }
}
</style>