# Repository Guidelines

## プロジェクト概要

cVim は Chrome に Vim 風のキーバインドを追加する拡張機能。上流の chromium-vim から派生し、Manifest V3 を使用する。ビルドを介さず、リポジトリ内のファイルを直接読み込む。

## 構成と読み込み

- `manifest.json`: 権限、Service Worker、Content Script の登録と読み込み順。
- `background_scripts/`: タブ操作、設定、履歴、ブックマーク、セッション、メッセージ処理。入口の `main.js` が各スクリプトを `importScripts()` で読み込む。
- `content_scripts/`: キー入力、マッピング、コマンド、リンクヒント、検索、スクロール、DOM 操作。`manifest.json` の順序で `document_start` に全フレームへ読み込む。
- `cvimrc_parser/`: cVimrc の PEG.js 文法と生成済みパーサー。実行時に読み込むコピーは `content_scripts/cvimrc_parser.js`。
- `pages/`: 設定画面、ポップアップ、ヘルプ、同梱の CodeMirror。HTML 側にもスクリプトの読み込み指定がある。
- `cmdline_frame.html`、`cmdline_frame.js`: コマンド入力用フレーム。
- `icons/`: 拡張機能のアイコン。
- `test/`: Jest のテストと共通モック。

実行時のコードは ES Modules ではなく、`Actions`、`Mappings`、`Scroll`、`RCParser` などのグローバルを共有する。変更時は参照元と読み込み順を確認し、名前の衝突を避ける。

## 開発コマンド

リポジトリのルートで実行する。

| コマンド | 用途 |
| --- | --- |
| `npm install` | 開発用依存関係のインストール |
| `npm test` | Jest の全テストを実行 |
| `npm test -- --runInBand` | 全テストを直列実行 |
| `npm test -- --runInBand test/content_scripts/scroll.test.js` | 対象テストだけを実行する例 |
| `npm run test:watch` | テストを監視実行 |
| `npm run test:coverage` | カバレッジを取得 |
| `npm run format` | JavaScript、JSON、CSS をリポジトリ全体で整形 |

通常の整形は `./node_modules/.bin/prettier --write <変更ファイル>` で対象を限定する。`lint` と `build` の npm スクリプト、Makefile、リポジトリ内の CI 設定は存在しない。

Chrome での確認は `chrome://extensions` のデベロッパーモードから、リポジトリのルートを「パッケージ化されていない拡張機能」として読み込む。変更後は拡張機能と対象ページを再読み込みし、操作結果とコンソールのエラーを確認する。

## 記法と実装方針

- 既存コードと `.prettierrc` に合わせ、空白 2 個、シングルクォート、セミコロン、LF を使用する。整形幅は 80、末尾カンマは `es5`。
- `.eslintrc` は残っているが、ESLint の依存関係と実行スクリプトはない。`switch` のインデントなどで既存コードと異なる規則があるため、変更箇所の記法を優先する。
- 関数やプロパティは周辺の命名に合わせる。ファイル名には `command_execute.js` や `tab_creation_order.js` のような `snake_case` もあるため、一律に変更しない。
- `var`、`let`、`const`、関数宣言の形式は変更箇所に合わせる。無関係な構文の置き換えや全体整形を混ぜない。
- 外部データは内部で利用し始める境界で検証する。検証済みの条件を内部処理で重複して検証しない。
- `if` は可能な限り早期リターンとする。`try/catch` は回復処理やエラーへの文脈追加が必要な場合に使い、エラーを握りつぶさない。
- 通常は発生しにくいケースへの対応で実装が複雑になる場合は、発生条件と増える複雑さを説明し、了承を得てから追加する。
- 同梱ライブラリと生成済みファイルへの変更は、目的に関係するものに限定する。

## パーサーの更新

文法の編集元は `cvimrc_parser/parser.peg`。生成済みの `cvimrc_parser/parser.js` と `content_scripts/cvimrc_parser.js` は同じ内容で管理し、後者を拡張機能が読み込む。

依存関係をインストールした後、文法を変更した場合に実行する。

```sh
./node_modules/.bin/pegjs --format globals --export-var RCParser --output cvimrc_parser/parser.js cvimrc_parser/parser.peg
./node_modules/.bin/prettier --write cvimrc_parser/parser.js
cp cvimrc_parser/parser.js content_scripts/cvimrc_parser.js
```

既存の公開形式はグローバルの `RCParser`。PEG.js の既定値である CommonJS 形式に置き換えない。文法変更には対応するテストと、設定やマッピングへの影響の説明を添える。

## テストと調査

- `jest.config.js` は `jsdom` を使用し、`test/**/*.test.js` と `test/**/*.spec.js` を検出する。
- `test/setup.js` は `setupFilesAfterEnv` から読み込まれ、`chrome`、DOM、コンソールのモックを初期化する。テスト用の API をエクスポートするファイルではない。
- 実コードを `fs.readFileSync()` と `eval()` で読み込む既存テストがある。依存するグローバルを準備し、実際の処理結果を検証する。モックの存在確認だけで動作確認を済ませない。
- バックグラウンド、Content Script、パーサーの動作を変更するときは、通常の動作と関連する境界条件・不具合の再現をテストする。対象テストで確認後、`npm test` で回帰を確認する。
- キー入力の問題は `content_scripts/keys.js` のイベント処理、`mappings.js` の Trie とキー列、コマンドや設定処理の順に調べる。入力モード、イベントの抑止、マッピングの前方一致を確認する。
- DOM や Chrome API の実際の挙動が関係する変更は、Chrome 上でも確認する。フレームやサイト固有設定が関係する場合は、その条件で再現を確認する。

## 作業とレビュー

- 日本語で簡潔に報告し、英単語と日本語の間には半角空白を入れる。作業中は定期的に進捗を報告する。
- 編集前に修正案を提示し、了承済みの範囲で進める。ユーザーの未コミット変更を保持する。
- 命名・構成・記法の説明が実コードと異なる場合は既存コードに合わせる。動作・仕様が異なる場合は、どちらを正とするかユーザーに確認する。見つけた相違点は最終報告に列挙する。
- README の `make` 手順と CLAUDE.md の省略されたパーサー生成手順には、現構成との差がある。開発コマンドと生成形式は上記を参照する。
- コミットを作成する場合は `type(scope): subject` を基本とし、英語の命令形、50 文字以内、末尾のピリオドなしとする。本文には必要に応じて動機と影響を記す。
- PR には変更の目的、関連 Issue、検証結果を記載する。画面の変更には画像などを添え、権限や設定構文を変えた場合は利用者への影響を説明する。
- `manifest.json` の権限は必要な範囲に限定する。秘密情報、個人の設定値、閲覧履歴などのユーザーデータをコミットしない。
