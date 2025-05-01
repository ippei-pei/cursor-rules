# Cursor Rules README

This directory contains rules that guide the AI assistant's behavior when working on this project. Rules are categorized by their primary function.

## Rule Naming Convention

Files are named using the format `XXX-description-<suffix>.mdc`. The suffix often hints at the type but the definitive type is listed below.

## Rule Types

*   **Always**: Rule is always active and applied.
*   **Auto-Attached**: Rule is automatically attached and activated when files matching its `Globs` pattern are opened or edited.
*   **Agent-Requested**: Rule defines a complex behavior or workflow, typically activated by user request (explicitly or implicitly) or by another rule/agent.
*   **Manual**: Rule provides guidance for tasks that primarily require manual steps or intervention.

## Rule Categories & Files

### 00x: Global & Core

*   **`000-global-communication-always.mdc`**: AIとユーザー間の全体的なコミュニケーション標準 (言語、トーン、フォーマット) を定義します。(Globs: `*`, Type: Always)
*   **`010-tech-stack-always.mdc`**: プロジェクトのコアとなる必須技術スタックを定義します。(Globs: `*`, Type: Always)

### 01x: Project Setup & Initialization

*   **`011-bootstrap-agent.mdc`**: 新規リポジトリやセットアップコマンド時に、プロジェクトの初期基盤 (Next.js, Firebase等) を構築します。(Globs: `["package.json"]`, Type: Agent-Requested)
*   **`012-repo-init-auto.mdc`**: リポジトリ初期設定 (npm init, Git設定, create-next-app等の競合解消) を扱います。(Globs: `["package.json"]`, Type: Agent-Requested)
*   **`013-typescript-strict-always.mdc`**: `tsconfig.json` が存在し、strict オプションが強制されていることを保証します。(Globs: N/A, Type: Always)
*   **`014-react-nextjs-setup-agent.mdc`**: フロントエンド (React/Next.js, Bootstrap) のセットアップまたは検証を行います。(Globs: `["package.json", "next.config.js"]`, Type: Agent-Requested)
*   **`019-manual-setup-guide.mdc`**: 自動化できない、手動での初期設定手順 (GCPプロジェクト選択, API有効化, Slackアプリ作成, Secret登録等) を記述します。(Globs: `*` (Referenced), Type: Manual)
*   **`050-templates-react-auto.mdc`**: Reactコンポーネント/Hook の標準テンプレートを生成します。(Globs: N/A, Type: Agent-Requested)

### 02x: Development Workflow

*   **`020-project-plan-agent.mdc`**: `plan.md` ファイルの管理 (作成、更新、ステータス追跡) を行います。(Globs: N/A, Type: Agent-Requested)
*   **`021-npm-scripts-husky-always.mdc`**: 標準のnpmスクリプトを定義し、Husky pre-commit フックを設定します。(Globs: N/A, Type: Always)

### 03x: Code Quality & Testing

*   **`030-quality-gate-always.mdc`**: コード変更後に必須の品質チェック (lint, 型チェック, テスト) を強制実行します。(Globs: N/A, Type: Always)
*   **`031-testing-standards-agent.mdc`**: ユニット、結合、E2Eテストの標準とツールを定義します。(Globs: N/A, Type: Agent-Requested)
*   **`032-lint-format-always.mdc`**: コードフォーマット (Prettier) と静的解析 (ESLint等) の標準を定義・強制します。(スタブ) (Globs: `[".eslintrc.js", ".eslintignore", ".prettierrc.json", ".prettierignore", "package.json"]`, Type: Always)

### 04x: Environment & Configuration

*   **`040-env-management-always.mdc`**: 環境変数 (`.env`, `.env.example`) の管理手順を定義します。(Globs: N/A, Type: Always)
*   **`041-env-logging-agent.mdc`**: アプリケーションログのセットアップと設定を行います。(現在空) (Globs: N/A, Type: Agent-Requested)

### 05x: Deployment & CI/CD

*   **`050-deploy-manual.mdc`**: 手動デプロイ手順 (Firebase Hosting/Functions等) を提供します。(Globs: N/A, Type: Manual)
*   **`051-ci-auto.mdc`**: CI/CD パイプライン (GitHub Actions等) のセットアップと設定を行います。(Globs: N/A, Type: Agent-Requested)
*   **`052-build-matrix-agent.mdc`**: CIでのビルドマトリクス (Nodeバージョン、OS等) の設定・管理を支援します。(スタブ) (Globs: `[".github/workflows/*.yml"]`, Type: Agent-Requested)
*   **`053-pr-lint-check-agent.mdc`**: Pull Request時の自動チェック (Lint等) の設定を支援します。(スタブ) (Globs: `[".github/workflows/*.yml"]`, Type: Agent-Requested)

### 06x: Security

*   **`060-security-auto..mdc`**: 基本的なセキュリティ対策 (npm audit, gitleaks等) を保証します。(Globs: N/A, Type: Agent-Requested)
*   **`061-dependency-check-agent.mdc`**: 依存関係の更新と脆弱性追跡を自動化します。(スタブ) (Globs: `["package.json", "package-lock.json"]`, Type: Agent-Requested)
*   **`062-secret-scan-agent.mdc`**: シークレットスキャンツール (gitleaks等) の設定と実行をガイドします。(スタブ) (Globs: `[".gitleaks.toml", ".github/workflows/*.yml", ".husky/pre-commit", ".husky/pre-push"]`, Type: Agent-Requested)

### 07x: Optional Features & Integrations

*   **`070-slack-integration-optional.mdc`**: Slack Bot および/または Slack OAuth ユーザー認証のセットアップをガイドします。(Globs: Complex list, Type: Auto-Attached)
*   **`071-google-drive-integration-optional.mdc`**: Google Drive API 連携のセットアップをガイドします。(Globs: Complex list, Type: Auto-Attached)
*   **`072-i18n-manual.mdc`**: 国際化 (i18n) の実装に関するガイダンスを提供します。(Globs: N/A, Type: Manual)

### 08x: Utility

*   **`080-error-catalog-auto.mdc`**: 繰り返されるビルド/ランタイムエラーを自動的にカタログ化します。(Globs: N/A, Type: Agent-Requested)
*   **`081-safe-debug-agent.mdc`**: 安全なデバッグ手法や制約を注入します。(Globs: N/A, Type: Agent-Requested)
*   **`082-error-reporting-manual.mdc`**: 解決済みのエラー/デバッグセッションの詳細を手動コマンドで記録します。(Globs: `*` (Manual command), Type: Manual)

### 99x: Meta Rules

*   **`990-rule-generating-agent.mdc`**: ルールファイルの作成・変更支援、および変更履歴の更新を行います。(Globs: Manual/Implicit, Type: Agent-Requested)
*   **`999-rule-metrics-agent.mdc`**: ルール実行実績を週次で集計・レポート化します。(Globs: `rules/*.mdc` (indirect), Type: Always)

*Note: "N/A" in the Globs column indicates that Globs information was not found or easily summarized from the rule's header.*