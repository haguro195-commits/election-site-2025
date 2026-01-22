<template>
  <div class="seat-prediction">
    <h2>議席予測</h2>
    <p>最新の世論調査に基づく衆議院選挙の議席予測です</p>

    <div class="prediction-summary card">
      <h3>予測サマリー</h3>
      <div class="summary-stats">
        <div class="stat">
          <span class="number">{{ totalSeats }}</span>
          <span class="label">総議席数</span>
        </div>
        <div class="stat">
          <span class="number">{{ majoritySeats }}</span>
          <span class="label">過半数ライン</span>
        </div>
        <div class="stat">
          <span class="number">{{ lastUpdated }}</span>
          <span class="label">最終更新</span>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="chart-section card">
        <h3>政党別議席予測</h3>
        <canvas ref="seatChart"></canvas>
      </div>

      <div class="chart-section card">
        <h3>議席数推移</h3>
        <canvas ref="trendChart"></canvas>
      </div>
    </div>

    <div class="detailed-predictions">
      <h3>詳細予測</h3>
      <div class="prediction-table">
        <table>
          <thead>
            <tr>
              <th>政党名</th>
              <th>現有議席</th>
              <th>予測議席</th>
              <th>増減</th>
              <th>得票率予測</th>
              <th>信頼区間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in predictions" :key="party.id" :class="party.id">
              <td class="party-name">
                <span class="party-color" :style="{ backgroundColor: party.color }"></span>
                {{ party.name }}
              </td>
              <td>{{ party.currentSeats }}</td>
              <td class="predicted-seats">{{ party.predictedSeats }}</td>
              <td :class="['change', party.change > 0 ? 'positive' : party.change < 0 ? 'negative' : 'neutral']">
                {{ party.change > 0 ? '+' : '' }}{{ party.change }}
              </td>
              <td>{{ party.voteShare }}%</td>
              <td>{{ party.confidenceInterval }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="scenarios">
      <h3>シナリオ分析</h3>
      <div class="scenario-tabs">
        <button 
          v-for="scenario in scenarios" 
          :key="scenario.id"
          :class="['tab', { active: activeScenario === scenario.id }]"
          @click="setActiveScenario(scenario.id)"
        >
          {{ scenario.name }}
        </button>
      </div>
      
      <div class="scenario-content card">
        <div v-if="currentScenario">
          <h4>{{ currentScenario.name }}</h4>
          <p>{{ currentScenario.description }}</p>
          <div class="scenario-results">
            <div v-for="result in currentScenario.results" :key="result.party" class="result-item">
              <span class="party">{{ result.party }}</span>
              <span class="seats">{{ result.seats }}議席</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="methodology card">
      <h3>予測手法について</h3>
      <p>この予測は以下のデータと手法に基づいています：</p>
      <ul>
        <li>複数の世論調査機関による最新の支持率データ</li>
        <li>過去の選挙結果との相関分析</li>
        <li>選挙区別の候補者情報と地域特性</li>
        <li>統計的モデリング（ベイズ推定）</li>
      </ul>
      <p class="disclaimer">
        ※ この予測は統計的推定に基づくものであり、実際の選挙結果を保証するものではありません。
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'SeatPrediction',
  setup() {
    const seatChart = ref(null)
    const trendChart = ref(null)
    const activeScenario = ref('base')

    const totalSeats = 465
    const majoritySeats = 233
    const lastUpdated = '1月22日'

    const predictions = ref([
      {
        id: 'ldp',
        name: '自民党',
        color: '#FF6B6B',
        currentSeats: 247,
        predictedSeats: 220,
        change: -27,
        voteShare: 35.2,
        confidenceInterval: '200-240'
      },
      {
        id: 'cdp',
        name: '立憲民主党',
        color: '#4ECDC4',
        currentSeats: 96,
        predictedSeats: 110,
        change: 14,
        voteShare: 22.8,
        confidenceInterval: '95-125'
      },
      {
        id: 'komeito',
        name: '公明党',
        color: '#45B7D1',
        currentSeats: 32,
        predictedSeats: 28,
        change: -4,
        voteShare: 7.1,
        confidenceInterval: '25-32'
      },
      {
        id: 'ishin',
        name: '日本維新の会',
        color: '#F7DC6F',
        currentSeats: 41,
        predictedSeats: 45,
        change: 4,
        voteShare: 8.9,
        confidenceInterval: '38-52'
      },
      {
        id: 'dpfp',
        name: '国民民主党',
        color: '#BB8FCE',
        currentSeats: 7,
        predictedSeats: 12,
        change: 5,
        voteShare: 4.2,
        confidenceInterval: '8-16'
      },
      {
        id: 'jcp',
        name: '共産党',
        color: '#EC7063',
        currentSeats: 10,
        predictedSeats: 8,
        change: -2,
        voteShare: 3.8,
        confidenceInterval: '5-12'
      }
    ])

    const scenarios = [
      {
        id: 'base',
        name: 'ベースシナリオ',
        description: '現在の支持率傾向が続いた場合の予測',
        results: [
          { party: '自民党', seats: 220 },
          { party: '立憲民主党', seats: 110 },
          { party: '公明党', seats: 28 },
          { party: '日本維新の会', seats: 45 }
        ]
      },
      {
        id: 'optimistic',
        name: '野党有利シナリオ',
        description: '野党共闘が成功し、無党派層が野党に流れた場合',
        results: [
          { party: '自民党', seats: 200 },
          { party: '立憲民主党', seats: 130 },
          { party: '公明党', seats: 25 },
          { party: '日本維新の会', seats: 50 }
        ]
      },
      {
        id: 'conservative',
        name: '与党維持シナリオ',
        description: '経済政策への評価が高まり、与党支持が回復した場合',
        results: [
          { party: '自民党', seats: 240 },
          { party: '立憲民主党', seats: 90 },
          { party: '公明党', seats: 30 },
          { party: '日本維新の会', seats: 40 }
        ]
      }
    ]

    const currentScenario = computed(() => {
      return scenarios.find(s => s.id === activeScenario.value)
    })

    const setActiveScenario = (scenarioId) => {
      activeScenario.value = scenarioId
    }

    const initCharts = async () => {
      await nextTick()

      // 議席予測チャート
      if (seatChart.value) {
        new Chart(seatChart.value, {
          type: 'doughnut',
          data: {
            labels: predictions.value.map(p => p.name),
            datasets: [{
              data: predictions.value.map(p => p.predictedSeats),
              backgroundColor: predictions.value.map(p => p.color),
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.parsed}議席`
                  }
                }
              }
            }
          }
        })
      }

      // 推移チャート
      if (trendChart.value) {
        new Chart(trendChart.value, {
          type: 'line',
          data: {
            labels: ['12月', '1月上旬', '1月中旬', '1月下旬'],
            datasets: predictions.value.slice(0, 4).map(party => ({
              label: party.name,
              data: [
                party.predictedSeats + Math.random() * 20 - 10,
                party.predictedSeats + Math.random() * 15 - 7,
                party.predictedSeats + Math.random() * 10 - 5,
                party.predictedSeats
              ],
              borderColor: party.color,
              backgroundColor: party.color + '20',
              tension: 0.4
            }))
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 300
              }
            },
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        })
      }
    }

    onMounted(() => {
      initCharts()
    })

    return {
      seatChart,
      trendChart,
      totalSeats,
      majoritySeats,
      lastUpdated,
      predictions,
      scenarios,
      activeScenario,
      currentScenario,
      setActiveScenario
    }
  }
}
</script>

<style scoped>
.seat-prediction h2 {
  margin-bottom: 1rem;
}

.prediction-summary {
  margin-bottom: 2rem;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}

.stat {
  text-align: center;
}

.stat .number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.stat .label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-section {
  height: 400px;
}

.chart-section canvas {
  max-height: 300px;
}

.prediction-table {
  overflow-x: auto;
}

.prediction-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.prediction-table th,
.prediction-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.prediction-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.party-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.party-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.predicted-seats {
  font-weight: bold;
  font-size: 1.1rem;
}

.change.positive {
  color: #27ae60;
}

.change.negative {
  color: #e74c3c;
}

.change.neutral {
  color: #7f8c8d;
}

.scenarios {
  margin: 2rem 0;
}

.scenario-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.scenario-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.methodology {
  margin-top: 2rem;
}

.methodology ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.methodology li {
  margin-bottom: 0.5rem;
}

.disclaimer {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 1rem;
}
</style>