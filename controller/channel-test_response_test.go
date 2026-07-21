package controller

import (
	"testing"

	"github.com/QuantumNous/new-api/dto"
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

func TestAggregateTestResponseBodyReturnsAssistantContent(t *testing.T) {
	body := []byte("data: {\"choices\":[{\"delta\":{\"content\":\"6\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{\"content\":\".0.7\"}}]}\n\n" +
		"data: [DONE]\n")
	require.Equal(t, "6.0.7", aggregateTestResponseBody(body, true))
}
