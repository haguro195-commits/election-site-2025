<template>
  <div class="election-map">
    <h2>選挙区マップ</h2>
    <p>全国の選挙区と立候補者情報を地図で確認できます</p>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>立候補者データを取得中...</p>
    </div>

    <div v-if="lastUpdated" class="update-info">
      最終更新: {{ new Date(lastUpdated).toLocaleString('ja-JP') }}
    </div>

    <div class="map-controls">
      <select v-model="selectedPrefecture" @change="filterByPrefecture">
        <option value="">都道府県を選択</option>
        <option v-for="pref in prefectures" :key="pref" :value="pref">
          {{ pref }}
        </option>
      </select>
      
      <select v-model="selectedParty" @change="filterByParty">
        <option value="">政党で絞り込み</option>
        <option v-for="party in parties" :key="party.id" :value="party.id">
          {{ party.name }}
        </option>
      </select>

      <div class="map-stats">
        <span class="stat">選挙区数: {{ districts.length }}</span>
        <span class="stat">総候補者数: {{ districts.reduce((sum, d) => sum + d.candidates.length, 0) }}</span>
      </div>
    </div>

    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
    </div>

    <div class="district-info" v-if="selectedDistrict">
      <h3>{{ selectedDistrict.name }}</h3>
      <div class="candidates">
        <h4>立候補者一覧（{{ selectedDistrict.candidates.length }}名）</h4>
        <div class="candidate-list">
          <div 
            v-for="candidate in selectedDistrict.candidates" 
            :key="candidate.id"
            class="candidate-card card"
          >
            <div class="candidate-header">
              <h5>{{ candidate.name }}</h5>
              <span class="incumbent-badge" v-if="candidate.isIncumbent">現職</span>
            </div>
            
            <div class="candidate-basic">
              <p class="party" :style="{ color: getPartyColor(candidate.party) }">
                {{ candidate.party }}
              </p>
              <p class="age">{{ candidate.age }}歳</p>
            </div>

            <div class="candidate-details">
              <div class="detail-item">
                <strong>経歴:</strong>
                <p>{{ candidate.experience }}</p>
              </div>
              
              <div class="detail-item" v-if="candidate.education">
                <strong>学歴:</strong>
                <p>{{ candidate.education }}</p>
              </div>
              
              <div class="detail-item" v-if="candidate.career">
                <strong>職歴:</strong>
                <p>{{ candidate.career }}</p>
              </div>
              
              <div class="detail-item" v-if="candidate.policies">
                <strong>主要政策:</strong>
                <ul class="policies-list">
                  <li v-for="policy in candidate.policies" :key="policy">
                    {{ policy }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="candidate-links" v-if="candidate.website || candidate.twitter">
              <a v-if="candidate.website" :href="candidate.website" target="_blank" class="btn btn-sm">
                🌐 公式サイト
              </a>
              <a v-if="candidate.twitter" :href="'https://twitter.com/' + candidate.twitter.replace('@', '')" target="_blank" class="btn btn-sm">
                🐦 Twitter
              </a>
            </div>

            <div class="candidate-actions">
              <button @click="toggleCandidateFavorite(candidate)" class="btn btn-secondary">
                {{ isCandidateFavorite(candidate.id) ? '★' : '☆' }} お気に入り
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import axios from 'axios'

// Leafletのアイコン問題を修正
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default {
  name: 'ElectionMap',
  setup() {
    const mapContainer = ref(null)
    const map = ref(null)
    const selectedPrefecture = ref('')
    const selectedParty = ref('')
    const selectedDistrict = ref(null)
    const loading = ref(false)
    const lastUpdated = ref(null)

    const prefectures = [
      '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
      '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
      '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
      '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
      '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
      '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
      '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ]

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

    // リアルタイム選挙区データ
    const districts = ref([])

    // 立候補者データを取得
    const fetchCandidatesData = async () => {
      loading.value = true
      try {
        const response = await axios.get('/.netlify/functions/fetch-candidates', {
          timeout: 30000
        })

        if (response.data.success) {
          districts.value = response.data.data
          lastUpdated.value = response.data.lastUpdated
          console.log(`${districts.value.length}選挙区のデータを取得しました`)
        } else {
          throw new Error(response.data.error || '立候補者データ取得に失敗')
        }
      } catch (error) {
        console.error('立候補者データ取得エラー:', error)
        
        // フォールバック: サンプルデータを使用
        districts.value = [
          {
            id: 1,
            name: '東京1区',
            prefecture: '東京都',
            lat: 35.6762,
            lng: 139.6503,
            candidates: [
              {
                id: 1,
                name: '田中太郎',
                party: '自民党',
                age: 45,
                experience: '元県議会議員',
                education: '東京大学法学部',
                career: '県議会議員2期、弁護士',
                policies: ['経済成長', '地方創生'],
                isIncumbent: true
              },
              {
                id: 2,
                name: '佐藤花子',
                party: '立憲民主党',
                age: 38,
                experience: '弁護士',
                education: '早稲田大学法学部',
                career: '弁護士10年、市民活動',
                policies: ['子育て支援', '環境保護'],
                isIncumbent: false
              }
            ]
          }
        ]
      } finally {
        loading.value = false
      }
    }

    const initMap = () => {
      map.value = L.map(mapContainer.value).setView([36.2048, 138.2529], 6)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value)

      updateMapMarkers()
    }

    const updateMapMarkers = () => {
      if (!map.value) return

      // 既存のマーカーをクリア
      map.value.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.value.removeLayer(layer)
        }
      })

      // フィルタリングされた選挙区のマーカーを追加
      const filteredDistricts = getFilteredDistricts()
      
      filteredDistricts.forEach(district => {
        // 政党別の候補者数を計算
        const partyCounts = {}
        district.candidates.forEach(candidate => {
          partyCounts[candidate.party] = (partyCounts[candidate.party] || 0) + 1
        })

        // 最多候補者の政党の色を使用
        const dominantParty = Object.keys(partyCounts).reduce((a, b) => 
          partyCounts[a] > partyCounts[b] ? a : b
        )
        const markerColor = getPartyColor(dominantParty)

        // カスタムマーカーアイコンを作成
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })

        const marker = L.marker([district.lat, district.lng], { icon: customIcon })
          .addTo(map.value)
          .bindPopup(createPopupContent(district))
          .on('click', () => selectDistrict(district.id))
      })
    }

    const createPopupContent = (district) => {
      const candidatesList = district.candidates.map(candidate => 
        `<li><strong>${candidate.name}</strong> (${candidate.party})</li>`
      ).join('')

      return `
        <div class="map-popup">
          <h4>${district.name}</h4>
          <p><strong>立候補者数:</strong> ${district.candidates.length}人</p>
          <ul style="margin: 0.5rem 0; padding-left: 1rem;">
            ${candidatesList}
          </ul>
          <button onclick="window.selectDistrictFromMap(${district.id})" 
                  style="background: #3498db; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
            詳細を見る
          </button>
        </div>
      `
    }

    const getFilteredDistricts = () => {
      let filtered = districts.value

      if (selectedPrefecture.value) {
        filtered = filtered.filter(district => 
          district.prefecture === selectedPrefecture.value
        )
      }

      if (selectedParty.value) {
        filtered = filtered.filter(district =>
          district.candidates.some(candidate => 
            getPartyId(candidate.party) === selectedParty.value
          )
        )
      }

      return filtered
    }

    const getPartyId = (partyName) => {
      const partyMap = {
        '自民党': 'ldp',
        '立憲民主党': 'cdp',
        '公明党': 'komeito',
        '国民民主党': 'dpfp',
        '共産党': 'jcp',
        '日本維新の会': 'ishin',
        'れいわ新選組': 'reiwa',
        '参政党': 'sanseito'
      }
      return partyMap[partyName] || 'other'
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

    const selectDistrict = (districtId) => {
      selectedDistrict.value = districts.value.find(d => d.id === districtId)
    }

    const filterByPrefecture = () => {
      updateMapMarkers()
    }

    const filterByParty = () => {
      updateMapMarkers()
    }

    const toggleCandidateFavorite = (candidate) => {
      // お気に入り機能実装
      console.log('Toggle favorite:', candidate)
    }

    const isCandidateFavorite = (candidateId) => {
      // お気に入り判定実装
      return false
    }

    // グローバル関数として登録
    window.selectDistrictFromMap = selectDistrict

    onMounted(async () => {
      await fetchCandidatesData()
      await nextTick()
      initMap()
    })

    return {
      mapContainer,
      selectedPrefecture,
      selectedParty,
      selectedDistrict,
      loading,
      lastUpdated,
      prefectures,
      parties,
      districts,
      filterByPrefecture,
      filterByParty,
      toggleCandidateFavorite,
      isCandidateFavorite,
      getPartyColor
    }
  }
}
</script>

<style scoped>
.election-map h2 {
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
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

.update-info {
  background: #e8f5e8;
  color: #2d5a2d;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.map-controls {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  align-items: center;
}

.map-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.map-stats {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.stat {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #495057;
}

.map-container {
  height: 500px;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

#map {
  height: 100%;
  width: 100%;
}

.district-info {
  margin-top: 2rem;
}

.district-info h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.candidate-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.candidate-card {
  border-left: 4px solid #3498db;
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.candidate-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.incumbent-badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.candidate-basic {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.candidate-basic .party {
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
}

.candidate-basic .age {
  color: #7f8c8d;
  margin: 0;
}

.candidate-details {
  margin-bottom: 1rem;
}

.detail-item {
  margin-bottom: 0.75rem;
}

.detail-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-item p {
  margin: 0;
  color: #555;
  line-height: 1.4;
}

.policies-list {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
}

.policies-list li {
  color: #555;
  margin-bottom: 0.25rem;
}

.candidate-links {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  text-decoration: none;
}

.candidate-actions {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

/* カスタムマーカー用のスタイル */
.custom-marker {
  background: transparent;
  border: none;
}

/* マップポップアップのスタイル */
.map-popup h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.map-popup ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.map-popup li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .map-stats {
    margin-left: 0;
    justify-content: center;
  }
  
  .candidate-list {
    grid-template-columns: 1fr;
  }
  
  .candidate-basic {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>