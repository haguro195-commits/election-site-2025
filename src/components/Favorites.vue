<template>
  <div class="favorites">
    <h2>お気に入り</h2>
    <p>保存したニュースと情報を管理できます</p>

    <div class="favorites-tabs">
      <button 
        :class="['tab', { active: activeTab === 'news' }]"
        @click="setActiveTab('news')"
      >
        ニュース記事
      </button>
      <button 
        :class="['tab', { active: activeTab === 'candidates' }]"
        @click="setActiveTab('candidates')"
      >
        候補者
      </button>
    </div>

    <div class="tab-content">
      <!-- ニュース記事タブ -->
      <div v-if="activeTab === 'news'" class="news-favorites">
        <div v-if="favoriteNews.length === 0" class="empty-state">
          <p>お気に入りのニュース記事がありません</p>
          <router-link to="/" class="btn">ニュースを見る</router-link>
        </div>
        
        <div v-else class="favorites-list">
          <div class="list-controls">
            <select v-model="newsFilter" @change="filterNews">
              <option value="">全ての政党</option>
              <option v-for="party in parties" :key="party.id" :value="party.id">
                {{ party.name }}
              </option>
            </select>
            
            <select v-model="newsSortBy" @change="sortNews">
              <option value="date">日付順</option>
              <option value="title">タイトル順</option>
              <option value="source">情報源順</option>
            </select>
          </div>

          <article 
            v-for="article in filteredNews" 
            :key="article.id"
            class="news-item card"
          >
            <h4>{{ article.title }}</h4>
            <p class="news-meta">
              {{ formatDate(article.date) }} - {{ article.source }}
              <span class="saved-date">保存日: {{ formatDate(article.savedAt) }}</span>
            </p>
            <p>{{ article.summary }}</p>
            <div class="news-actions">
              <a :href="article.url" target="_blank" class="btn">記事を読む</a>
              <button @click="removeFromFavorites('news', article.id)" class="btn btn-danger">
                削除
              </button>
              <button @click="shareArticle(article)" class="btn btn-secondary">
                共有
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- 候補者タブ -->
      <div v-if="activeTab === 'candidates'" class="candidate-favorites">
        <div v-if="favoriteCandidates.length === 0" class="empty-state">
          <p>お気に入りの候補者がいません</p>
          <router-link to="/map" class="btn">選挙区マップを見る</router-link>
        </div>
        
        <div v-else class="favorites-list">
          <div class="list-controls">
            <select v-model="candidateFilter" @change="filterCandidates">
              <option value="">全ての政党</option>
              <option v-for="party in parties" :key="party.id" :value="party.name">
                {{ party.name }}
              </option>
            </select>
            
            <select v-model="candidateSortBy" @change="sortCandidates">
              <option value="name">名前順</option>
              <option value="party">政党順</option>
              <option value="district">選挙区順</option>
            </select>
          </div>

          <div class="candidate-grid">
            <div 
              v-for="candidate in filteredCandidates" 
              :key="candidate.id"
              class="candidate-card card"
            >
              <h4>{{ candidate.name }}</h4>
              <p class="party">{{ candidate.party }}</p>
              <p class="district">{{ candidate.district }}</p>
              <p class="age">{{ candidate.age }}歳</p>
              <p class="experience">{{ candidate.experience }}</p>
              <div class="candidate-actions">
                <button @click="removeFromFavorites('candidates', candidate.id)" class="btn btn-danger">
                  削除
                </button>
                <button @click="shareCandidate(candidate)" class="btn btn-secondary">
                  共有
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- エクスポート機能 -->
    <div class="export-section card">
      <h3>データのエクスポート</h3>
      <p>お気に入りのデータをファイルとして保存できます</p>
      <div class="export-buttons">
        <button @click="exportData('json')" class="btn">JSON形式でエクスポート</button>
        <button @click="exportData('csv')" class="btn btn-secondary">CSV形式でエクスポート</button>
      </div>
    </div>

    <!-- インポート機能 -->
    <div class="import-section card">
      <h3>データのインポート</h3>
      <p>以前にエクスポートしたお気に入りデータを読み込めます</p>
      <input 
        type="file" 
        ref="fileInput" 
        @change="importData" 
        accept=".json,.csv"
        style="display: none"
      >
      <button @click="$refs.fileInput.click()" class="btn">ファイルを選択</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFavoritesStore } from '../stores/favoritesStore'

export default {
  name: 'Favorites',
  setup() {
    const favoritesStore = useFavoritesStore()
    const activeTab = ref('news')
    const newsFilter = ref('')
    const newsSortBy = ref('date')
    const candidateFilter = ref('')
    const candidateSortBy = ref('name')
    const fileInput = ref(null)

    const parties = [
      { id: 'ldp', name: '自民党' },
      { id: 'cdp', name: '立憲民主党' },
      { id: 'komeito', name: '公明党' },
      { id: 'dpfp', name: '国民民主党' },
      { id: 'jcp', name: '共産党' },
      { id: 'ishin', name: '日本維新の会' },
      { id: 'reiwa', name: 'れいわ新選組' },
      { id: 'sanseito', name: '参政党' }
    ]

    const favoriteNews = computed(() => favoritesStore.favoriteNews)
    const favoriteCandidates = computed(() => favoritesStore.favoriteCandidates)

    const filteredNews = computed(() => {
      let filtered = favoriteNews.value

      if (newsFilter.value) {
        filtered = filtered.filter(article => 
          article.parties && article.parties.includes(newsFilter.value)
        )
      }

      // ソート
      filtered.sort((a, b) => {
        switch (newsSortBy.value) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'source':
            return a.source.localeCompare(b.source)
          case 'date':
          default:
            return new Date(b.date) - new Date(a.date)
        }
      })

      return filtered
    })

    const filteredCandidates = computed(() => {
      let filtered = favoriteCandidates.value

      if (candidateFilter.value) {
        filtered = filtered.filter(candidate => 
          candidate.party === candidateFilter.value
        )
      }

      // ソート
      filtered.sort((a, b) => {
        switch (candidateSortBy.value) {
          case 'party':
            return a.party.localeCompare(b.party)
          case 'district':
            return a.district.localeCompare(b.district)
          case 'name':
          default:
            return a.name.localeCompare(b.name)
        }
      })

      return filtered
    })

    const setActiveTab = (tab) => {
      activeTab.value = tab
    }

    const filterNews = () => {
      // フィルタリングはcomputed propertyで自動実行
    }

    const sortNews = () => {
      // ソートはcomputed propertyで自動実行
    }

    const filterCandidates = () => {
      // フィルタリングはcomputed propertyで自動実行
    }

    const sortCandidates = () => {
      // ソートはcomputed propertyで自動実行
    }

    const removeFromFavorites = (type, id) => {
      if (confirm('お気に入りから削除しますか？')) {
        favoritesStore.removeFromFavorites(type, id)
      }
    }

    const shareArticle = (article) => {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        })
      } else {
        // フォールバック: クリップボードにコピー
        navigator.clipboard.writeText(`${article.title}\n${article.url}`)
        alert('リンクをクリップボードにコピーしました')
      }
    }

    const shareCandidate = (candidate) => {
      const text = `${candidate.name}（${candidate.party}・${candidate.district}）`
      if (navigator.share) {
        navigator.share({
          title: `候補者情報: ${candidate.name}`,
          text: text
        })
      } else {
        navigator.clipboard.writeText(text)
        alert('候補者情報をクリップボードにコピーしました')
      }
    }

    const exportData = (format) => {
      const data = {
        news: favoriteNews.value,
        candidates: favoriteCandidates.value,
        exportDate: new Date().toISOString()
      }

      let content, filename, mimeType

      if (format === 'json') {
        content = JSON.stringify(data, null, 2)
        filename = `favorites_${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else if (format === 'csv') {
        // CSV形式での出力（簡易版）
        const csvNews = favoriteNews.value.map(article => 
          `"${article.title}","${article.source}","${article.date}","${article.url}"`
        ).join('\n')
        
        content = `ニュース記事\nタイトル,情報源,日付,URL\n${csvNews}\n\n候補者\n名前,政党,選挙区,年齢\n`
        content += favoriteCandidates.value.map(candidate =>
          `"${candidate.name}","${candidate.party}","${candidate.district}","${candidate.age}"`
        ).join('\n')
        
        filename = `favorites_${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    const importData = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.news && data.candidates) {
            favoritesStore.importFavorites(data)
            alert('データを正常にインポートしました')
          } else {
            alert('無効なファイル形式です')
          }
        } catch (error) {
          alert('ファイルの読み込みに失敗しました')
        }
      }
      reader.readAsText(file)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
    }

    onMounted(() => {
      favoritesStore.loadFavorites()
    })

    return {
      activeTab,
      newsFilter,
      newsSortBy,
      candidateFilter,
      candidateSortBy,
      fileInput,
      parties,
      favoriteNews,
      favoriteCandidates,
      filteredNews,
      filteredCandidates,
      setActiveTab,
      filterNews,
      sortNews,
      filterCandidates,
      sortCandidates,
      removeFromFavorites,
      shareArticle,
      shareCandidate,
      exportData,
      importData,
      formatDate
    }
  }
}
</script>

<style scoped>
.favorites h2 {
  margin-bottom: 1rem;
}

.favorites-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tab {
  background: #ecf0f1;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab:hover {
  background: #d5dbdb;
}

.tab.active {
  background: #3498db;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.list-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.list-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.favorites-list {
  margin-bottom: 2rem;
}

.news-item {
  margin-bottom: 1rem;
}

.news-item h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.news-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.saved-date {
  margin-left: 1rem;
  font-style: italic;
}

.news-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.candidate-card h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.candidate-card .party {
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.25rem;
}

.candidate-card .district,
.candidate-card .age,
.candidate-card .experience {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.candidate-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-danger {
  background: #e74c3c;
}

.btn-danger:hover {
  background: #c0392b;
}

.export-section,
.import-section {
  margin-top: 2rem;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
</style>