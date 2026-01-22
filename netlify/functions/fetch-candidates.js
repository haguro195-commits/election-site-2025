// Netlify Functions - 立候補者情報取得API
const axios = require('axios')

exports.handler = async (event, context) => {
    // CORS設定
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' }
    }

    try {
        // 選挙区パラメータを取得
        const { district } = event.queryStringParameters || {}

        // 立候補者データを生成（実際の選挙では総務省APIや選管データを使用）
        const candidatesData = await generateCandidatesData(district)

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: candidatesData,
                lastUpdated: new Date().toISOString()
            })
        }

    } catch (error) {
        console.error('立候補者データ取得エラー:', error)

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: '立候補者データの取得に失敗しました',
                message: error.message
            })
        }
    }
}

// 立候補者データ生成関数（実際の選挙では外部APIから取得）
async function generateCandidatesData(targetDistrict) {
    // 全国の主要選挙区データ
    const districts = [
        {
            id: 1,
            name: '北海道1区',
            prefecture: '北海道',
            lat: 43.0642,
            lng: 141.3469,
            candidates: [
                {
                    id: 101,
                    name: '佐藤北海',
                    party: '自民党',
                    age: 52,
                    experience: '元道議会議員',
                    education: '北海道大学法学部',
                    career: '弁護士、道議会議員2期',
                    policies: ['地域経済活性化', '農業支援', '観光振興'],
                    website: 'https://example.com/sato',
                    twitter: '@sato_hokkai',
                    isIncumbent: true
                },
                {
                    id: 102,
                    name: '田中雪子',
                    party: '立憲民主党',
                    age: 45,
                    experience: '元市議会議員',
                    education: '早稲田大学政治経済学部',
                    career: '市議会議員3期、NPO代表',
                    policies: ['子育て支援', '環境保護', '格差是正'],
                    website: 'https://example.com/tanaka',
                    twitter: '@tanaka_yukiko',
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
                    id: 201,
                    name: '山田太郎',
                    party: '自民党',
                    age: 48,
                    experience: '元官僚',
                    education: '東京大学法学部',
                    career: '財務省勤務15年、衆議院議員2期',
                    policies: ['経済成長', '規制改革', 'デジタル化推進'],
                    website: 'https://example.com/yamada',
                    twitter: '@yamada_taro',
                    isIncumbent: true
                },
                {
                    id: 202,
                    name: '鈴木花子',
                    party: '立憲民主党',
                    age: 42,
                    experience: '弁護士',
                    education: '慶應義塾大学法学部',
                    career: '弁護士10年、市民活動家',
                    policies: ['人権保護', '司法制度改革', '女性活躍推進'],
                    website: 'https://example.com/suzuki',
                    twitter: '@suzuki_hanako',
                    isIncumbent: false
                },
                {
                    id: 203,
                    name: '高橋次郎',
                    party: '日本維新の会',
                    age: 39,
                    experience: '元起業家',
                    education: '京都大学経済学部',
                    career: 'IT企業経営、ベンチャー投資',
                    policies: ['行政改革', 'スタートアップ支援', '教育改革'],
                    website: 'https://example.com/takahashi',
                    twitter: '@takahashi_jiro',
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
                    id: 301,
                    name: '中村大阪',
                    party: '日本維新の会',
                    age: 44,
                    experience: '元府議会議員',
                    education: '大阪大学経済学部',
                    career: '府議会議員2期、地方議員10年',
                    policies: ['地方分権', '関西経済圏', '万博成功'],
                    website: 'https://example.com/nakamura',
                    twitter: '@nakamura_osaka',
                    isIncumbent: true
                },
                {
                    id: 302,
                    name: '伊藤関西',
                    party: '自民党',
                    age: 50,
                    experience: '元商工会議所職員',
                    education: '関西大学商学部',
                    career: '商工会議所20年、経済団体役員',
                    policies: ['中小企業支援', '商業振興', 'インバウンド'],
                    website: 'https://example.com/ito',
                    twitter: '@ito_kansai',
                    isIncumbent: false
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
                    id: 401,
                    name: '加藤製造',
                    party: '自民党',
                    age: 55,
                    experience: '元経営者',
                    education: '名古屋大学工学部',
                    career: '製造業経営30年、経済団体理事',
                    policies: ['製造業支援', '技術革新', '輸出促進'],
                    website: 'https://example.com/kato',
                    twitter: '@kato_seizo',
                    isIncumbent: true
                },
                {
                    id: 402,
                    name: '渡辺労働',
                    party: '立憲民主党',
                    age: 47,
                    experience: '元労働組合幹部',
                    education: '中京大学経済学部',
                    career: '労働組合幹部15年、労働問題専門',
                    policies: ['労働者保護', '賃金向上', '働き方改革'],
                    website: 'https://example.com/watanabe',
                    twitter: '@watanabe_rodo',
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
                    id: 501,
                    name: '松本九州',
                    party: '自民党',
                    age: 49,
                    experience: '元県議会議員',
                    education: '九州大学法学部',
                    career: '県議会議員3期、地方行政経験豊富',
                    policies: ['九州経済圏', 'アジア交流', '地方創生'],
                    website: 'https://example.com/matsumoto',
                    twitter: '@matsumoto_kyushu',
                    isIncumbent: true
                },
                {
                    id: 502,
                    name: '林アジア',
                    party: '立憲民主党',
                    age: 43,
                    experience: '元国際機関職員',
                    education: '上智大学外国語学部',
                    career: 'JICA職員10年、国際協力専門',
                    policies: ['国際協力', '多文化共生', '平和外交'],
                    website: 'https://example.com/hayashi',
                    twitter: '@hayashi_asia',
                    isIncumbent: false
                }
            ]
        }
    ]

    // 特定の選挙区が指定された場合はフィルタリング
    if (targetDistrict) {
        return districts.filter(d =>
            d.name.includes(targetDistrict) ||
            d.prefecture.includes(targetDistrict)
        )
    }

    return districts
}

// 政党カラー取得
function getPartyColor(party) {
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
    return colors[party] || '#95A5A6'
}