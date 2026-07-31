package controller

import (
	"net/http"
	"net/url"
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/stretchr/testify/require"
)

func TestValidateTestResponseBodyRequiresViteVersion(t *testing.T) {
	require.NoError(t, validateTestResponseBody([]byte(`data: {"text":"Vite 6.1.2"}`), true))
	require.Error(t, validateTestResponseBody([]byte(`data: {"text":"latest release"}`), true))
}

func TestBuildTestRequestUsesViteVersionPrompt(t *testing.T) {
	request, ok := buildTestRequest("gpt-4o-mini", "", nil, true).(*dto.GeneralOpenAIRequest)
	require.True(t, ok)
	require.Len(t, request.Messages, 1)
	require.Equal(t, channelTestPrompt, request.Messages[0].Content)
	require.NotNil(t, request.Stream)
	require.True(t, *request.Stream)
}

func TestBuildResponsesTestRequestUsesViteVersionPrompt(t *testing.T) {
	request, ok := buildTestRequest(
		"gpt-5.6-luna",
		string(constant.EndpointTypeOpenAIResponse),
		nil,
		true,
	).(*dto.OpenAIResponsesRequest)
	require.True(t, ok)
	require.JSONEq(t, `[{"role":"user","content":"`+channelTestPrompt+`"}]`, string(request.Input))
	require.NotNil(t, request.Stream)
	require.True(t, *request.Stream)
}

func TestBuildCodexTestRequestUsesViteVersionPrompt(t *testing.T) {
	request, ok := buildTestRequest("gpt-5-codex", "", nil, true).(*dto.OpenAIResponsesRequest)
	require.True(t, ok)
	require.JSONEq(t, `[{"role":"user","content":"`+channelTestPrompt+`"}]`, string(request.Input))
}

func TestAggregateTestResponseBodyReturnsAssistantContent(t *testing.T) {
	body := []byte("data: {\"choices\":[{\"delta\":{\"content\":\"6\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{\"content\":\".0.7\"}}]}\n\n" +
		"data: [DONE]\n")
	require.Equal(t, "6.0.7", aggregateTestResponseBody(body, true))
}

func TestAggregateTestResponseBodySupportsResponsesAndAnthropicStreams(t *testing.T) {
	responsesBody := []byte("data: {\"type\":\"response.output_text.delta\",\"delta\":\"6.\"}\n\n" +
		"data: {\"type\":\"response.output_text.delta\",\"delta\":\"1.0\"}\n\n")
	require.Equal(t, "6.1.0", aggregateTestResponseBody(responsesBody, true))

	anthropicBody := []byte("data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"6.2\"}}\n\n" +
		"data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\".0\"}}\n\n")
	require.Equal(t, "6.2.0", aggregateTestResponseBody(anthropicBody, true))
}

func TestAggregateTestResponseBodySupportsNonStreamFormats(t *testing.T) {
	require.Equal(t, "6.3.0", aggregateTestResponseBody([]byte(`{"output_text":"6.3.0"}`), false))
	require.Equal(t, "6.4.0", aggregateTestResponseBody([]byte(`{"content":[{"type":"text","text":"6.4.0"}]}`), false))
}

func TestRedactChannelTestHeaders(t *testing.T) {
	headers := http.Header{
		"Authorization": []string{"Bearer secret"},
		"X-Api-Key":     []string{"secret"},
		"Content-Type":  []string{"application/json"},
	}
	redacted := redactChannelTestHeaders(headers)
	require.Equal(t, "[REDACTED]", redacted["Authorization"])
	require.Equal(t, "[REDACTED]", redacted["X-Api-Key"])
	require.Equal(t, "application/json", redacted["Content-Type"])
}

func TestRedactChannelTestURL(t *testing.T) {
	requestURL, err := url.Parse("https://example.com/v1/messages?api_key=secret&version=1")
	require.NoError(t, err)
	require.Equal(t, "https://example.com/v1/messages?api_key=%5BREDACTED%5D&version=1", redactChannelTestURL(requestURL))
}
