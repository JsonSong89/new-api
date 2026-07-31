# 自用功能修改说明

## 渠道管理

- 查看渠道秘钥取消 Passkey 二次认证，保留管理员根权限校验。
  - 修改文件：`router/channel-router.go`、`controller/channel.go`
- 渠道测试默认使用 SSE 流式请求，测试提示词改为查询 Vite 最新版本。
- 渠道测试校验上游响应中包含类似 `6.1` 或 `6.1.2` 的版本号，并在前端展示上游返回内容。
- SSE 测试结果聚合 `choices[0].delta.content`，仅展示拼接后的模型回复，不展示原始 chunk 数据。
- 自动渠道测试统一使用 SSE 流式请求。
- 操作列中快速测试移入下拉菜单，手动选择模型测试保留在外层入口。
  - 修改文件：`controller/channel-test.go`、`controller/channel-test_response_test.go`
  - 修改文件：`web/src/features/channels/components/data-table-row-actions.tsx`
  - 修改文件：`web/src/features/channels/components/dialogs/channel-test-dialog.tsx`
  - 修改文件：`web/src/features/channels/lib/channel-actions.ts`、`web/src/features/channels/types.ts`

## 使用日志

- `/usage-logs/common` 管理员视图增加操作列。
- 消耗日志和错误日志支持按当前状态启用/禁用关联渠道、修改渠道优先级，并在渠道 ID 后显示当前优先级。
  - 修改文件：`web/src/features/usage-logs/components/columns/common-logs-columns.tsx`

## v1.0.2

- 渠道复制弹窗支持可选的新渠道名称、新渠道地址和新渠道秘钥；填写新名称时不再追加名称后缀。
- 使用日志移动端卡片补充渠道操作入口，支持启用/禁用渠道和修改优先级。
- 渠道测试自动选择更匹配的请求规范：Anthropic 渠道使用 `/v1/messages`，OpenAI 渠道的 GPT-5.x 模型使用 `/v1/responses`，其他 OpenAI 模型继续使用 `/v1/chat/completions`。
- 渠道测试成功结果也支持打开详情查看上游返回内容。

## 官方代码同步检查（2026-07-28）

- 已适配官方 `relaykit` 协议层重构，渠道测试仍使用查询 Vite 最新版本的自定义提示词及版本号校验。
- Anthropic、OpenAI Chat Completions、OpenAI Responses 的流式和非流式返回内容均可正确聚合展示。
- 渠道测试详情继续展示脱敏后的请求地址、请求头、请求体、响应状态、响应头和完整响应体。
- 渠道复制的自定义名称、地址和秘钥功能保持生效。
- PC 与移动端使用日志中的渠道启用/禁用及优先级操作入口保持生效。
- 查看渠道秘钥继续仅保留 Root 权限校验，不要求 Passkey 二次认证。

## v1.0.3

- 合并官方最新代码并适配 `relaykit` 协议层重构，保留全部自用功能修改。

## v1.0.4

- 公共日志页面默认结束时间调整为当天 `23:59:59`；当前时间达到 23 点后，默认结束时间调整为次日 `23:59:59`。

## v1.0.5

- 修复 OpenAI Responses 和 Codex 渠道测试仍发送默认 `hi` 的问题，统一改为询问 Vite 最新版本的自定义测试提示词。
