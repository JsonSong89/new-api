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
