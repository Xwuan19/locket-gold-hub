package proxy_test

import (
	"encoding/json"
	"os"
	"strings"
	"testing"

	"locket-proxy/proxy/handler"
	tlspkg "locket-proxy/proxy/tls"
)

func TestCA_LoadAndForge(t *testing.T) {
	crtBytes, err := os.ReadFile("../../ca/root-ca.crt")
	if err != nil {
		t.Fatalf("failed to read test root-ca.crt: %v", err)
	}
	keyBytes, err := os.ReadFile("../../ca/root-ca.key")
	if err != nil {
		t.Fatalf("failed to read test root-ca.key: %v", err)
	}

	ca, err := tlspkg.LoadCA(crtBytes, keyBytes)
	if err != nil {
		t.Fatalf("LoadCA failed: %v", err)
	}

	cache := tlspkg.NewCertCache(ca)
	host := "firebaseremoteconfig.googleapis.com"

	leaf1, err := cache.GetOrForge(host)
	if err != nil {
		t.Fatalf("GetOrForge failed: %v", err)
	}
	if len(leaf1.Certificate) < 2 {
		t.Fatalf("expected certificate chain with leaf + root, got %d", len(leaf1.Certificate))
	}

	leaf2, err := cache.GetOrForge(host)
	if err != nil {
		t.Fatalf("second GetOrForge failed: %v", err)
	}
	if leaf1 != leaf2 {
		t.Fatalf("expected cached certificate pointer to match")
	}
}

func TestHandler_InjectFirebase(t *testing.T) {
	initial := []byte(`{"entries":{"foo":"bar"},"state":"UPDATE"}`)
	injected, err := handler.InjectFirebase(initial)
	if err != nil {
		t.Fatalf("InjectFirebase returned error: %v", err)
	}

	var parsed map[string]any
	if err := json.Unmarshal(injected, &parsed); err != nil {
		t.Fatalf("unmarshal modified body failed: %v", err)
	}

	if !strings.Contains(parsed["Attention"].(string), "Locket-XVIP Activated") {
		t.Errorf("Attention header missing, got %v", parsed["Attention"])
	}

	entries := parsed["entries"].(map[string]any)
	if entries["max_friends_count"] != "999999" {
		t.Errorf("expected max_friends_count 999999, got %v", entries["max_friends_count"])
	}

	var camera map[string]any
	if err := json.Unmarshal([]byte(entries["camera"].(string)), &camera); err != nil {
		t.Fatalf("unmarshal camera config failed: %v", err)
	}
	if camera["gold_max_duration"] != 60.0 {
		t.Errorf("expected gold_max_duration 60.0, got %v", camera["gold_max_duration"])
	}

	cfgStr, ok := entries["camera_filter_config"].(string)
	if !ok || cfgStr == "" {
		t.Fatalf("expected non-empty camera_filter_config")
	}
	for _, expectedID := range []string{"khung_nh_shin_chan_vi_n_m_nh", "khung_hello_kitty_pastel_ng_t_ng_o", "photobooth_4cut", "looks_maxxing", "stk_dio_looksmaxing", "stk_rose_flower"} {
		if !strings.Contains(cfgStr, expectedID) {
			t.Errorf("expected camera_filter_config to contain %s", expectedID)
		}
	}

	celebStr, ok := entries["celebrity_filter_config"].(string)
	if !ok || !strings.Contains(celebStr, "celebrityUid") {
		t.Errorf("expected celebrity_filter_config with celebrityUid, got %v", celebStr)
	}
}

func TestHandler_InjectRevenueCat(t *testing.T) {
	initial := []byte(`{"subscriber":{"subscriptions":{},"entitlements":{}}}`)
	injected, err := handler.InjectRevenueCat(initial)
	if err != nil {
		t.Fatalf("InjectRevenueCat returned error: %v", err)
	}

	var parsed map[string]any
	if err := json.Unmarshal(injected, &parsed); err != nil {
		t.Fatalf("unmarshal modified body failed: %v", err)
	}

	sub := parsed["subscriber"].(map[string]any)
	ents := sub["entitlements"].(map[string]any)
	if ents["Gold"] == nil {
		t.Errorf("missing Gold entitlement")
	}

	subs := sub["subscriptions"].(map[string]any)
	if subs["locket_1600_1y"] == nil {
		t.Errorf("missing locket_1600_1y subscription")
	}
}

func TestHandler_CleanFilterResponse(t *testing.T) {
	initial := []byte(`{"error":"payment_required","errors":[{"code":402}],"result":{"error":"payment_required","status":402,"outputUrl":"https://example.com/pb.jpg"}}`)
	cleaned := handler.CleanFilterResponse(initial)

	var parsed map[string]any
	if err := json.Unmarshal(cleaned, &parsed); err != nil {
		t.Fatalf("unmarshal cleaned body failed: %v", err)
	}

	if _, exists := parsed["error"]; exists {
		t.Errorf("expected top-level error to be deleted")
	}
	if _, exists := parsed["errors"]; exists {
		t.Errorf("expected top-level errors to be deleted")
	}

	res, ok := parsed["result"].(map[string]any)
	if !ok {
		t.Fatalf("missing result object")
	}
	if _, exists := res["error"]; exists {
		t.Errorf("expected result.error to be deleted")
	}
	if res["status"] != float64(200) && res["status"] != 200 {
		t.Errorf("expected result.status 200, got %v", res["status"])
	}
	if res["outputUrl"] != "https://example.com/pb.jpg" {
		t.Errorf("outputUrl corrupted, got %v", res["outputUrl"])
	}
}

func TestHandler_LocketAPI(t *testing.T) {
	if !handler.IsChangeProfileInfo("/v1/changeProfileInfo") {
		t.Errorf("expected IsChangeProfileInfo to match /v1/changeProfileInfo")
	}

	mockResp := handler.ChangeProfileInfoMockResponse()
	var mockParsed map[string]any
	if err := json.Unmarshal(mockResp, &mockParsed); err != nil {
		t.Fatalf("unmarshal mock response failed: %v", err)
	}
	data := mockParsed["data"].(map[string]any)
	if data["badge"] != "locket_gold" || data["is_gold"] != true {
		t.Errorf("expected badge locket_gold and is_gold true, got %v", data)
	}

	initial := []byte(`{"data":{"uid":"user123","blurred_url":"https://example.com/blur.jpg","unblurred_url":"https://example.com/clear.jpg","is_locked":true}}`)
	modified := handler.RewriteLocketAPI(initial)

	var parsed map[string]any
	if err := json.Unmarshal(modified, &parsed); err != nil {
		t.Fatalf("unmarshal modified API failed: %v", err)
	}
	userData := parsed["data"].(map[string]any)
	if userData["badge"] != "locket_gold" {
		t.Errorf("expected badge locket_gold, got %v", userData["badge"])
	}
	if userData["is_locked"] != false {
		t.Errorf("expected is_locked false, got %v", userData["is_locked"])
	}
	if userData["blurred_url"] != "https://example.com/clear.jpg" {
		t.Errorf("expected blurred_url replaced with unblurred_url, got %v", userData["blurred_url"])
	}
}

func TestHandler_PhotoboothAndOverlayFrames(t *testing.T) {
	reqJSON := []byte(`{"data":{"imageUrl":"https://firebasestorage.googleapis.com/v0/b/locket/pic.jpg","filterId":"khung_nh_shin_chan_vi_n_m_nh"}}`)
	photoURL, filterID := handler.ExtractPhotoURLAndFilterID(reqJSON)
	if photoURL != "https://firebasestorage.googleapis.com/v0/b/locket/pic.jpg" {
		t.Errorf("expected photoURL to be parsed, got %s", photoURL)
	}
	if filterID != "khung_nh_shin_chan_vi_n_m_nh" {
		t.Errorf("expected filterID to be khung_nh_shin_chan_vi_n_m_nh, got %s", filterID)
	}

	if !handler.IsOverlayOrPhotoboothFilter(filterID) {
		t.Errorf("expected khung_nh_shin_chan_vi_n_m_nh to be overlay frame")
	}
	if !handler.IsOverlayOrPhotoboothFilter("photobooth_4cut") {
		t.Errorf("expected photobooth_4cut to be overlay frame")
	}
	if !handler.IsOverlayOrPhotoboothFilter("khung_hello_kitty_pastel_ng_t_ng_o") {
		t.Errorf("expected Hello Kitty to be overlay frame")
	}
	if handler.IsOverlayOrPhotoboothFilter("looks_maxxing") {
		t.Errorf("looks_maxxing should not be overlay frame")
	}

	mockResp := handler.BuildMockFilterResponse(photoURL)
	var parsed map[string]any
	if err := json.Unmarshal(mockResp, &parsed); err != nil {
		t.Fatalf("unmarshal mock filter response failed: %v", err)
	}
	res, ok := parsed["result"].(map[string]any)
	if !ok || res["outputUrl"] != photoURL {
		t.Errorf("expected outputUrl to match photoURL, got %v", res["outputUrl"])
	}
}
