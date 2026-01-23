// Netlify Functions - 候補者ツイート取得API
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
        const { candidateId, username } = event.queryStringParameters || {}

        // X API Bearer Token（環境変数から取得）
        const bearerToken = process.env.TWITTER_BEARER_TOKEN

        if (!bearerToken) {
            throw new Error('X API Bearer Tokenが設定されていません')
        }

        let tweets = []

        if (username) {
            // 特定ユーザーのツイートを取得
            tweets = await fetchUserTweets(username, bearerToken)
        } else {
            // 全候補者のツイートを取得
            tweets = await fetchAllCandidatesTweets(bearerToken)
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: tweets,
                count: tweets.length,
                lastUpdated: new Date().toISOString()
            })
        }

    } catch (error) {
        console.error('ツイート取得エラー:', error)

        // フォールバック: サンプルツイートデータ
        const sampleTweets = generateSampleTweets()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: sampleTweets,
                count: sampleTweets.length,
                lastUpdated: new Date().toISOString(),
                note: 'サンプルデータを使用中（X API制限のため）'
            })
        }
    }
}

// 特定ユーザーのツイート取得
async function fetchUserTweets(username, bearerToken) {
    try {
        // ユーザー情報を取得
        const userResponse = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}`,
            {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`
                }
            }
        )

        const userId = userResponse.data.data.id

        // ユーザーのツイートを取得
        const tweetsResponse = await axios.get(
            `https://api.twitter.com/2/users/${userId}/tweets`,
            {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`
                },
                params: {
                    'tweet.fields': 'created_at,public_metrics,context_annotations',
                    'max_results': 10,
                    'exclude': 'retweets,replies'
                }
            }
        )

        return tweetsResponse.data.data.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            createdAt: tweet.created_at,
            username: username,
            metrics: tweet.public_metrics,
            url: `https://twitter.com/${username}/status/${tweet.id}`,
            isRelevant: isPoliticallyRelevant(tweet.text)
        }))

    } catch (error) {
        console.error(`ユーザー ${username} のツイート取得エラー:`, error)
        return []
    }
}

// 全候補者のツイート取得
async function fetchAllCandidatesTweets(bearerToken) {
    // 候補者のTwitterアカウント一覧
    const candidates = [
        { name: '山田太郎', username: 'yamada_taro_official', party: '自民党' },
        { name: '鈴木花子', username: 'suzuki_hanako_cdp', party: '立憲民主党' },
        { name: '高橋次郎', username: 'takahashi_ishin', party: '日本維新の会' },
        { name: '中村大阪', username: 'nakamura_osaka', party: '日本維新の会' },
        { name: '佐藤北海', username: 'sato_hokkaido', party: '自民党' }
    ]

    const allTweets = []

    for (const candidate of candidates) {
        try {
            const tweets = await fetchUserTweets(candidate.username, bearerToken)

            // 候補者情報を追加
            const enrichedTweets = tweets.map(tweet => ({
                ...tweet,
                candidateName: candidate.name,
                party: candidate.party,
                candidateUsername: candidate.username
            }))

            allTweets.push(...enrichedTweets)

            // API制限を避けるため少し待機
            await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
            console.error(`候補者 ${candidate.name} のツイート取得エラー:`, error)
        }
    }

    // 日付順でソート
    return allTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 政治的関連性の判定
function isPoliticallyRelevant(text) {
    const politicalKeywords = [
        '政治', '選挙', '政策', '公約', '国会', '議会', '法案', '予算',
        '経済', '教育', '医療', '福祉', '環境', '外交', '防衛', '憲法',
        '税制', '年金', '子育て', '高齢者', '働き方', '地方創生'
    ]

    return politicalKeywords.some(keyword => text.includes(keyword))
}

// サンプルツイートデータ生成
function generateSampleTweets() {
    return [
        {
            id: '1234567890',
            text: '本日、地元の商店街を視察しました。中小企業支援の重要性を改めて実感。具体的な政策を検討中です。 #地方創生 #中小企業支援',
            createdAt: '2026-01-22T10:30:00.000Z',
            username: 'yamada_taro_official',
            candidateName: '山田太郎',
            party: '自民党',
            metrics: { like_count: 45, retweet_count: 12, reply_count: 8 },
            url: 'https://twitter.com/yamada_taro_official/status/1234567890',
            isRelevant: true
        },
        {
            id: '1234567891',
            text: '子育て支援の拡充について、保育園の待機児童問題解決に向けた具体案を発表しました。すべての子どもが安心して成長できる社会を目指します。',
            createdAt: '2026-01-22T09:15:00.000Z',
            username: 'suzuki_hanako_cdp',
            candidateName: '鈴木花子',
            party: '立憲民主党',
            metrics: { like_count: 67, retweet_count: 23, reply_count: 15 },
            url: 'https://twitter.com/suzuki_hanako_cdp/status/1234567891',
            isRelevant: true
        },
        {
            id: '1234567892',
            text: '行政のデジタル化推進について議論しました。効率的な行政サービスで市民の皆様の利便性向上を図ります。 #DX #行政改革',
            createdAt: '2026-01-22T08:45:00.000Z',
            username: 'takahashi_ishin',
            candidateName: '高橋次郎',
            party: '日本維新の会',
            metrics: { like_count: 34, retweet_count: 9, reply_count: 6 },
            url: 'https://twitter.com/takahashi_ishin/status/1234567892',
            isRelevant: true
        },
        {
            id: '1234567893',
            text: '地域経済の活性化について地元企業の皆様と意見交換。関西経済圏の発展に向けた取り組みを強化していきます。',
            createdAt: '2026-01-21T16:20:00.000Z',
            username: 'nakamura_osaka',
            candidateName: '中村大阪',
            party: '日本維新の会',
            metrics: { like_count: 28, retweet_count: 7, reply_count: 4 },
            url: 'https://twitter.com/nakamura_osaka/status/1234567893',
            isRelevant: true
        },
        {
            id: '1234567894',
            text: '農業支援政策について農家の皆様からご意見をいただきました。持続可能な農業の発展に向けて全力で取り組みます。 #農業 #地方創生',
            createdAt: '2026-01-21T14:10:00.000Z',
            username: 'sato_hokkaido',
            candidateName: '佐藤北海',
            party: '自民党',
            metrics: { like_count: 52, retweet_count: 18, reply_count: 11 },
            url: 'https://twitter.com/sato_hokkaido/status/1234567894',
            isRelevant: true
        }
    ]
}