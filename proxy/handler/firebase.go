package handler

import (
	"encoding/json"
	"fmt"
	"time"
)

// ponytail: production-verified RemoteConfig dictionary mirroring Locket-XVIP. Upgrade if dynamic runtime seller customization API is requested.
var firebaseOverrides = map[string]string{
	"feature_gates": `{"app_icon_picker":"enabled","camera_roll":"enabled","camera_theme":"enabled","locket_views":"enabled","long_captions":"enabled","longer_video":"enabled","unlimited_friends":"enabled","priority_support":"enabled","profile_badge":"enabled","remove_ads":"enabled","video":"enabled","custom_widget_frames":"enabled","streak_recovery":"enabled","longer_videos":"enabled","longer_camera_roll_videos":"enabled","camera_roll_video":"enabled","camera_roll_video_upload":"enabled","camera_roll_longer_videos":"enabled","video_trimmer":"enabled","camera_filter":"enabled","camera_filters":"enabled","filters":"enabled","ai_filters":"enabled","ai_filter":"enabled","likeness":"enabled","ai_likeness":"enabled","create_likeness":"enabled","likeness_creation":"enabled","face_filter":"enabled","face_filters":"enabled","ai_styles":"enabled","ai_style":"enabled","avatars":"enabled","avatar":"enabled","can_record_30s_video":"enabled","can_upload_30s_video":"enabled"}`,
	
	"camera_filter_enabled":         "true",
	"camera_filters_enabled":        "true",
	"filters_enabled":               "true",
	"ai_filters_enabled":            "true",
	"camera_filter_sheet_enabled":   "true",
	"camera_filter_picker_enabled":  "true",
	"camera_ai_filters_enabled":     "true",
	"likeness_enabled":              "true",
	"ai_likeness_enabled":           "true",
	"create_likeness_enabled":       "true",
	"likeness_creation_enabled":     "true",
	"camera_filter_likeness_enabled": "true",
	"camera_likeness_enabled":       "true",
	"face_filters_enabled":          "true",
	"face_filter_enabled":           "true",
	"ai_styles_enabled":             "true",
	"profile_badge_visible":         "true",
	"lunar_new_year_app_icon_enabled": "true",
	"android_subscribe_gold_button_enabled": "false",

	"upsell_features": `{"app_icon_picker":true,"camera_roll":true,"camera_theme":true,"locket_views":true,"remove_ads":true,"custom_widget_frames":true,"longer_video":true,"longer_videos":true,"longer_camera_roll_videos":true,"camera_roll_video":true,"camera_roll_video_upload":true,"video":true,"video_trimmer":true,"camera_filter":true,"camera_filters":true,"filters":true,"ai_filters":true,"streak_recovery":true,"unlimited_friends":true}`,

	"paywall_presentation_config": `{"uid":"paywall_testflight","onboarding":false,"after_sent_moment":false,"on_foreground":false,"interval":2592000,"profile_banner":true}`,

	"feature_discovery_popup_config": `{"tag":"LOCKET GOLD VIP","tag_gradient":true,"tag_style":"gold_gradient","title":"Đã Kích Hoạt 💛","feature_set":[{"title":"LocketXwuan ✨","body":"30s Video Real • 4K HD • Photobooth 4 Ô • AI Filters","imageURL":"https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/assets/locket_gold.jpg"}],"primary_button_title":"Bắt Đầu","campaign":"locket_gold_welcome_v3","start_at":"2020-01-01T00:00:00","end_at":"2099-12-31T23:59:59","use_local_time_zone":true}`,

	"camera": `{"gold_max_duration":30.0,"goldMaxDuration":30.0,"max_duration":30.0,"maxDuration":30.0,"ultra_wide":true,"ultraWide":true,"volume_button":true,"volumeButton":true,"flash_button":true,"telephoto":true,"srgb":true,"lanczos":true,"quality_mbps":0.9,"qualityMbps":0.9}`,

	"camera_roll": `{"enabled":true,"video_enabled":true,"video_upload_enabled":true,"longer_videos_enabled":true,"gold_max_duration":30.0,"goldMaxDuration":30.0,"video_max_duration":30.0,"videoMaxDuration":30.0,"max_duration":30.0,"maxDuration":30.0,"trim_max_duration":30.0,"trimMaxDuration":30.0,"camera_roll_max_duration":30.0,"cameraRollMaxDuration":30.0,"max_video_duration":30.0,"maxVideoDuration":30.0,"duration":30.0,"quality_mbps":0.9,"qualityMbps":0.9,"flash_button":true,"trimmer":{"max_duration":30.0,"gold_max_duration":30.0}}`,

	"live_photos": `{"capture":true,"viewing":true,"catch_up":true,"widget_looping_mode":"never"}`,

	// Photobooth 4-cut collage and AR AI filters verified in Locket-XVIP
	"camera_filter_config": `{"allows_custom_filters":true,"allowsCustomFilters":true,"show_filter_button":true,"showFilterButton":true,"sheet_enabled":true,"sheetEnabled":true,"open_sheet_immediately":true,"openSheetImmediately":true,"reference_image_attachment_enabled":true,"referenceImageAttachmentEnabled":true,"sheet_filters":[{"title":{"en":"Photobooth 4 Ô"},"filter_ids":["frame_berry_days","frame_happy_snap","frame_sky_diary","photobooth_4cut","photobooth_cute","pb_holo_4cut","pb_scrapbook_ripped_4cut","pb_ripped_paper_4cut","pb_denim_ripped_2x2","frame_classic_pb"]},{"title":{"en":"Goofy"},"filter_ids":["okay_wig","influencer","looks_maxxing","toothless","bye_brows"]},{"title":{"en":"Looks"},"filter_ids":["bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces","bye_brows"]},{"title":{"en":"Celebrate"},"filter_ids":["slimed","princess","disco_lights","cash_money","happy_birthday"]},{"title":{"en":"Cute"},"filter_ids":["cutesy","sticker_face","flower_crown","love_bug"]},{"title":{"en":"Costumes"},"filter_ids":["wedding","cowboy_cowgirl","giraffe","clown"]},{"title":{"en":"Holidays"},"filter_ids":["easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"]}],"sheetFilters":[{"title":{"en":"Photobooth 4 Ô"},"filter_ids":["frame_berry_days","frame_happy_snap","frame_sky_diary","photobooth_4cut","photobooth_cute","pb_holo_4cut","pb_scrapbook_ripped_4cut","pb_ripped_paper_4cut","pb_denim_ripped_2x2","frame_classic_pb"]},{"title":{"en":"Goofy"},"filter_ids":["okay_wig","influencer","looks_maxxing","toothless","bye_brows"]},{"title":{"en":"Looks"},"filter_ids":["bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces","bye_brows"]},{"title":{"en":"Celebrate"},"filter_ids":["slimed","princess","disco_lights","cash_money","happy_birthday"]},{"title":{"en":"Cute"},"filter_ids":["cutesy","sticker_face","flower_crown","love_bug"]},{"title":{"en":"Costumes"},"filter_ids":["wedding","cowboy_cowgirl","giraffe","clown"]},{"title":{"en":"Holidays"},"filter_ids":["easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"]}],"picker_filters":["frame_berry_days","frame_happy_snap","frame_sky_diary","photobooth_4cut","photobooth_cute","pb_holo_4cut","pb_scrapbook_ripped_4cut","pb_ripped_paper_4cut","pb_denim_ripped_2x2","frame_classic_pb","okay_wig","influencer","looks_maxxing","toothless","bye_brows","bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces","slimed","princess","disco_lights","cash_money","happy_birthday","cutesy","sticker_face","flower_crown","love_bug","wedding","cowboy_cowgirl","giraffe","clown","easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"],"pickerFilters":["frame_berry_days","frame_happy_snap","frame_sky_diary","photobooth_4cut","photobooth_cute","pb_holo_4cut","pb_scrapbook_ripped_4cut","pb_ripped_paper_4cut","pb_denim_ripped_2x2","frame_classic_pb","okay_wig","influencer","looks_maxxing","toothless","bye_brows","bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces","slimed","princess","disco_lights","cash_money","happy_birthday","cutesy","sticker_face","flower_crown","love_bug","wedding","cowboy_cowgirl","giraffe","clown","easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"]}`,

	// Video durations & audio flags
	"camera_roll_preview_enabled":        "true",
	"camera_roll_video_enabled":          "true",
	"camera_roll_video_upload_enabled":   "true",
	"internal_camera_roll_video_upload_enabled": "true",
	"longer_camera_roll_videos_enabled":  "true",
	"camera_roll_longer_videos_enabled":  "true",
	"longer_video_enabled":               "true",
	"longer_videos_enabled":              "true",
	"video_enabled":                      "true",
	"video_trimmer_enabled":              "true",
	"camera_roll_video_max_duration":     "30.0",
	"camera_roll_max_duration":           "30.0",
	"camera_roll_duration":               "30.0",
	"camera_roll_video_trim_max_duration": "30.0",
	"camera_roll_trim_max_duration":       "30.0",
	"video_trimmer_max_duration":         "30.0",
	"video_trim_max_duration":             "30.0",
	"trim_max_duration":                  "30.0",
	"max_video_duration":                 "30.0",
	"video_max_duration":                 "30.0",
	"gold_max_duration":                  "30.0",
	"goldMaxDuration":                    "30.0",
	"camera_roll_video_max_duration_sec": "30",
	"camera_roll_max_duration_sec":       "30",
	"video_max_duration_sec":             "30",
	"trim_max_duration_sec":              "30",
	"video_quality_mbps":                 "0.9",
	"video_sound_enabled":                "true",
	"microphone_enabled":                 "true",
	"camera_microphone_enabled":          "true",
	"audio_session_deactivation_enabled": "true",
	"zoom_enabled":                       "true",
	"upload_main":                        "false",
	"upload_main_image_quality":          "1.0",
	"upload_main_image_size":             "1440",
	"upload_thumbnail_image_quality":     "1.0",
	"upload_thumbnail_image_size":        "1020",

	// Block ads & disable tracking (Sentry)
	"history_ads_mode":                   "off",
	"history_ads_prefetch_count":         "0",
	"history_ads_prefetch_immediate":     "false",
	"history_ads_prefetch_reroute":       "false",
	"history_ads_dynamic_insertion":     "false",
	"history_ads_refresh_prefetch_on_foreground": "false",
	"history_ads_floor_price":            "0",
	"history_ads_floor_price_att":        "0",
	"history_ad_log_displayed_on_background": "false",
	"history_ads_debug_menu":             "false",
	"ads_enabled":                        "false",
	"sentry_sample_rate":                 "0",
	"sentry_network_tracing":             "false",
	"sentry_performance_tracking":        "false",
	"sentry_trace_sample_rate":           "0",
	"sentry_profiles_sample_rate":        "0",

	// 999999 Friends limit & suggestions
	"max_friends_count":                  "999999",
	"friend_limit_mode":                  "0",
	"soft_friend_limit_threshold_count":  "999999",
	"show_friend_limit_on_cam":           "false",
	"signup_max_friends_count":           "999999",
	"celebrity_inbox_limit":              "999999",
	"new_friends_monitoring_enabled":     "true",
	"improved_friend_suggestions":        "true",
	"show_friend_suggestions_by_default": "true",
	"emoji_friend_suggestions":          "true",
	"prompt_contact_permissions_on_search": "true",
	"hide_friends_enabled":               "true",
	"hide_invite_links":                  "false",
	"show_all_contacts":                  "true",
	"show_invite_suggestions":           "true",
	"show_no_friends_bottom_sheet":       "false",

	// Trending Widget Frame (Low G / Retro Album UI)
	"widget_frame_event_max_images":      "5",
	"android_widget_frame_event_enabled": "true",
	"widget_badge_enabled":               "true",
	"widget_badge_v2":                    "true",
	"widget_frame_event":                 `{"uid":"frame_lowg_l2k_2026","url":"https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/assets/frames/frame_lowg_l2k.png","use_local_time_zone":true,"placement":"above","start_at":"2020-01-01T00:00:00","end_at":"2099-12-31T23:59:59"}`,

	// Moments, reactions & chat
	"moment_views_enabled":                "true",
	"moment_views_v2":                     "true",
	"record_moment_views":                 "true",
	"notify_moment_views":                 "true",
	"moment_reactions_v2":                 "true",
	"chat_reactions_enabled":              "true",
	"conversation_reactions":             "true",
	"typing_indicators_enabled":           "true",
	"unsend_message_enabled":              "true",
	"conversations_enabled":               "true",
	"groups_enabled":                      "true",
	"time_travel_rewind_v2_enabled":       "true",

	// Overlay dynamic captions
	"overlay_navigator_enabled":           "true",
	"captions_enabled":                    "true",
	"music_caption_enabled":               "true",
	"music_caption_song_preview_enabled":  "true",
	"link_caption_link_enabled":           "true",
	"overlay_dynamic_captions":            `["standard","poll","color_palette","review","music","location","weather","time","streak","star_sign","party_time","locket_count","good_morning","goodnight","ootd","miss_you","custom","phunu_2010","halloween_2026"]`,

	// System & Cache optimizations
	"image_cache_max_age_sec":             "157680000",
	"image_cache_max_size":                "400000000",
	"history_cache_age_days":              "1000",
	"user_cache_max_age_sec":              "691200",
	"friends_cache_max_age_sec":           "2592000",
	"image_fetch_cache":                   "true",
	"get_latest_moment_v2":                "true",
	"beta_features_enabled":               "true",
	"join_testflight_enabled":             "true",
}

func InjectFirebase(body []byte) ([]byte, error) {
	var raw map[string]any
	if err := json.Unmarshal(body, &raw); err != nil {
		raw = make(map[string]any)
	}

	raw["Attention"] = "Locket-XVIP Activated (30s Video Real + AI Filters + Photobooth 4 Ô)!"
	raw["state"] = "UPDATE"
	raw["templateVersion"] = fmt.Sprintf("%d", time.Now().UnixMilli())

	entries, ok := raw["entries"].(map[string]any)
	if !ok || entries == nil {
		entries = make(map[string]any)
	}

	for k, v := range firebaseOverrides {
		entries[k] = v
	}
	raw["entries"] = entries

	return json.Marshal(raw)
}
