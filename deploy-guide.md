# 衆議院選挙2025サイト - 実装・デプロイガイド

## 1. 本番ビルド

### ビルドの実行
```bash
npm run build
```

### 生成されるファイル
- `dist/` フォルダに本番用ファイルが生成されます
- HTML、CSS、JavaScriptが最適化されます

## 2. ホスティング選択肢

### A. 静的サイトホスティング（推奨）
- **Netlify**: 無料プランあり、自動デプロイ
- **Vercel**: 高速、GitHubと連携
- **GitHub Pages**: 無料、GitHubリポジトリから直接
- **Firebase Hosting**: Googleのサービス

### B. VPSサーバー
- **さくらのVPS**: 日本国内、高速
- **ConoHa VPS**: 時間課金、スケーラブル
- **AWS EC2**: 世界規模、高機能

## 3. ドメイン設定

### 推奨ドメイン例
- `shuuin2025.jp`
- `election2025-news.com`
- `senkyo-info.jp`

### DNS設定
```
A レコード: @ → サーバーIP
CNAME レコード: www → ドメイン名
```

## 4. SSL証明書
- Let's Encrypt（無料）
- CloudFlare（無料プランあり）
- 有料SSL証明書

## 5. CDN設定（推奨）
- CloudFlare
- AWS CloudFront
- 画像・CSS・JSの高速配信

## 6. 監視・分析
- Google Analytics
- Google Search Console
- アップタイム監視サービス