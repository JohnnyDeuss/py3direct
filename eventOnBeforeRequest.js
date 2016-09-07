chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		return { redirectUrl: details.url.replace(/\/\d+(\.\d+)*\//, "/3/") };
	},
	{
		urls: ["https://docs.python.org/*"],
		types: ["main_frame", "sub_frame"]
	},
	["blocking"]);

// Remove cached files on install to ensure v2 docs aren't loaded from cache.
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.webRequest.handlerBehaviorChanged();
});