# html2image-test

`textarea` に入力した HTML をクライアント側だけで `canvas` に描画し、PNG 化して表示する GitHub Pages 向けの単一ページです。

## 使い方

1. `index.html` と `script.js` を GitHub Pages で配信します。
2. HTML を入力して `画像化する` を押します。
3. `canvas` と PNG プレビューが更新されます。
4. `PNG を保存` で保存できます。

## 実装メモ

- 外部ライブラリは未使用です。
- `script.js` に変換ロジックを分離しています。
- SVG の `foreignObject` を経由して HTML を `canvas` に描画しています。
- 外部画像やフォントは CORS の影響を受ける場合があります。
- `foreignObject` なしで任意 HTML をブラウザ差異なく画像化することは、純粋なブラウザ標準 API だけでは現実的ではありません。
