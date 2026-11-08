package handler

import (
	"encoding/json"
)

// ponytail: strips error objects to enforce 200 OK for Photobooth/AI filter responses. Upgrade if partial error logging is needed.
func CleanFilterResponse(body []byte) []byte {
	var root map[string]any
	if err := json.Unmarshal(body, &root); err != nil {
		return body
	}

	delete(root, "error")
	delete(root, "errors")

	if res, ok := root["result"].(map[string]any); ok {
		delete(res, "error")
		delete(res, "errors")
		res["status"] = 200
	}

	cleaned, err := json.Marshal(root)
	if err != nil {
		return body
	}
	return cleaned
}
