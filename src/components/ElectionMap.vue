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
import { Loader } from '@googlemaps/js-api-loader'
import axios from 'axios'

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
              name: '北海道1区',
              prefecture: '北海道',
              lat: 43.0642,
              lng: 141.3469,
              candidates: [
                {
                  id: 1,
                  name: '佐藤北海',
                  party: '自民党',
                  age: 52,
                  experience: '元道議会議員',
                  education: '北海道大学法学部',
                  career: '弁護士、道議会議員2期',
                  policies: ['地域経済活性化', '農業支援', '観光振興'],
                  isIncumbent: true
                },
                {
                  id: 2,
                  name: '田中雪子',
                  party: '立憲民主党',
                  age: 45,
                  experience: '元市議会議員',
                  education: '早稲田大学政治経済学部',
                  career: '市議会議員3期、NPO代表',
                  policies: ['子育て支援', '環境保護', '格差是正'],
                  isIncumbent: false
                }
              ]
            },
            {
              id: 2,
              name: '東京1区',
              prefecture: '東京都',
              lat: 35.6762,
              lng: 139.6503,
              candidates: [
                {
                  id: 3,
                  name: '山田太郎',
                  party: '公明党',
                  age: 58,
                  experience: '元区議会議員',
                  education: '慶應義塾大学経済学部',
                  career: '区議会議員4期、会社員',
                  policies: ['福祉充実', '教育改革', '平和外交'],
                  isIncumbent: false
                }
              ]
            },
            {
              id: 3,
              name: '大阪1区',
              prefecture: '大阪府',
              lat: 34.6937,
              lng: 135.5023,
              candidates: [
                {
                  id: 4,
                  name: '鈴木花子',
                  party: '国民民主党',
                  age: 41,
                  experience: '元府議会議員',
                  education: '大阪大学法学部',
                  career: '府議会議員2期、弁護士',
                  policies: ['働き方改革', '女性活躍', '地方創生'],
                  isIncumbent: true
                }
              ]
            },
            {
              id: 4,
              name: '愛知1区',
              prefecture: '愛知県',
              lat: 35.1815,
              lng: 136.9066,
              candidates: [
                {
                  id: 5,
                  name: '高橋次郎',
                  party: '日本維新の会',
                  age: 48,
                  experience: '元市議会議員',
                  education: '名古屋大学工学部',
                  career: '市議会議員3期、エンジニア',
                  policies: ['デジタル化推進', '規制緩和', '行政改革'],
                  isIncumbent: false
                }
              ]
            },
            {
              id: 5,
              name: '福岡1区',
              prefecture: '福岡県',
              lat: 33.5904,
              lng: 130.4017,
              candidates: [
                {
                  id: 6,
                  name: '伊藤美咲',
                  party: 'れいわ新選組',
                  age: 39,
                  experience: '市民活動家',
                  education: '九州大学法学部',
                  career: 'NPO代表、市民活動10年',
                  policies: ['格差是正', '最低賃金引上げ', '消費税廃止'],
                  isIncumbent: false
                }
              ]
            }
        ]
      } finally {
        loading.value = false
      }
    }

    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-w-9RuY", // デモ用キー（実際の使用時は環境変数に設定）
        version: "weekly",
        libraries: ["places"]
      })

      try {
        const google = await loader.load()
        
        map.value = new google.maps.Map(mapContainer.value, {
          center: { lat: 36.2048, lng: 138.2529 }, // 日本の中心
          zoom: 6,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        updateMapMarkers()
      } catch (error) {
        console.error('Google Maps読み込みエラー:', error)
        // フォールバック: シンプルな地図表示
        mapContainer.value.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; color: #6c757d;">
            <div style="text-align: center;">
              <p>地図を読み込めませんでした</p>
              <p>選挙区情報は下記の一覧でご確認ください</p>
            </div>
          </div>
        `
      }
    }

    const updateMapMarkers = async () => {
      if (!map.value || !window.google) return

      // 既存のマーカーをクリア
      if (window.mapMarkers) {
        window.mapMarkers.forEach(marker => marker.setMap(null))
      }
      window.mapMarkers = []

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

        // Google Mapsマーカーを作成
        const marker = new google.maps.Marker({
          position: { lat: district.lat, lng: district.lng },
          map: map.value,
          title: district.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: markerColor,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        // 情報ウィンドウを作成
        const infoWindow = new google.maps.InfoWindow({
          content: createPopupContent(district)
        })

        // マーカークリックイベント
        marker.addListener('click', () => {
          // 他の情報ウィンドウを閉じる
          if (window.currentInfoWindow) {
            window.currentInfoWindow.close()
          }
          
          infoWindow.open(map.value, marker)
          window.currentInfoWindow = infoWindow
          selectDistrict(district.id)
        })

        window.mapMarkers.push(marker)
      })
    }

    const createPopupContent = (district) => {
      const candidatesList = district.candidates.map(candidate => 
        `<li><strong>${candidate.name}</strong> (${candidate.party})</li>`
      ).join('')

      return `
        <div class="map-popup" style="min-width: 200px;">
          <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50; font-size: 1.1rem;">${district.name}</h4>
          <p style="margin: 0.25rem 0; font-weight: bold;">立候補者数: ${district.candidates.length}人</p>
          <ul style="margin: 0.5rem 0; padding-left: 1rem; max-height: 120px; overflow-y: auto;">
            ${candidatesList}
          </ul>
          <button onclick="window.selectDistrictFromMap(${district.id})" 
                  style="background: #3498db; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 0.5rem;">
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

/* Google Maps用のスタイル */
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

/* Google Maps情報ウィンドウ内のスタイル */
.gm-style-iw {
  padding: 0;
}

.gm-style-iw-d {
  overflow: hidden !important;
}

.map-popup {
  padding: 0.5rem;
}

.map-popup h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.map-popup ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
  max-height: 120px;
  overflow-y: auto;
}

.map-popup li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
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

/* カスタムマーカー用のスタイル（削除） */

/* マップポップアップのスタイル（Google Maps用に調整済み） */

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