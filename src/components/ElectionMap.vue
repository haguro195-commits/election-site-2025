<template>
  <div class="election-map">
    <h2>選挙区マップ</h2>
    <p>全国の選挙区と立候補者情報を地図で確認できます</p>

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
    </div>

    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
    </div>

    <div class="district-info" v-if="selectedDistrict">
      <h3>{{ selectedDistrict.name }}</h3>
      <div class="candidates">
        <h4>立候補者一覧</h4>
        <div class="candidate-list">
          <div 
            v-for="candidate in selectedDistrict.candidates" 
            :key="candidate.id"
            class="candidate-card card"
          >
            <h5>{{ candidate.name }}</h5>
            <p class="party">{{ candidate.party }}</p>
            <p class="age">{{ candidate.age }}歳</p>
            <p class="experience">{{ candidate.experience }}</p>
            <button @click="toggleCandidateFavorite(candidate)" class="btn btn-secondary">
              {{ isCandidateFavorite(candidate.id) ? '★' : '☆' }} お気に入り
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'

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

    // サンプルデータ
    const districts = ref([
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
            experience: '元県議会議員'
          },
          {
            id: 2,
            name: '佐藤花子',
            party: '立憲民主党',
            age: 38,
            experience: '弁護士'
          }
        ]
      },
      {
        id: 2,
        name: '大阪1区',
        prefecture: '大阪府',
        lat: 34.6937,
        lng: 135.5023,
        candidates: [
          {
            id: 3,
            name: '山田次郎',
            party: '日本維新の会',
            age: 42,
            experience: '市議会議員'
          }
        ]
      }
    ])

    const initMap = () => {
      map.value = L.map(mapContainer.value).setView([36.2048, 138.2529], 6)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value)

      // 選挙区マーカーを追加
      districts.value.forEach(district => {
        const marker = L.marker([district.lat, district.lng])
          .addTo(map.value)
          .bindPopup(`
            <div>
              <h4>${district.name}</h4>
              <p>立候補者数: ${district.candidates.length}人</p>
              <button onclick="selectDistrict(${district.id})">詳細を見る</button>
            </div>
          `)
      })
    }

    const selectDistrict = (districtId) => {
      selectedDistrict.value = districts.value.find(d => d.id === districtId)
    }

    const filterByPrefecture = () => {
      // 都道府県による絞り込み実装
      console.log('Prefecture filter:', selectedPrefecture.value)
    }

    const filterByParty = () => {
      // 政党による絞り込み実装
      console.log('Party filter:', selectedParty.value)
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
    window.selectDistrict = selectDistrict

    onMounted(async () => {
      await nextTick()
      initMap()
    })

    return {
      mapContainer,
      selectedPrefecture,
      selectedParty,
      selectedDistrict,
      prefectures,
      parties,
      filterByPrefecture,
      filterByParty,
      toggleCandidateFavorite,
      isCandidateFavorite
    }
  }
}
</script>

<style scoped>
.election-map h2 {
  margin-bottom: 1rem;
}

.map-controls {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.map-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.candidate-card h5 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.candidate-card .party {
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.25rem;
}

.candidate-card .age,
.candidate-card .experience {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}
</style>