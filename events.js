chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var url = URI(details.url);
		if (!(url.hasSearch("redirect_fail") || url.hasSearch("v_before") || url.segment(0) == "3")) {
			url
				.addSearch("v_before", url.segment(0))		// Keep original version in query string.
				.segment(0, "3");							// Change to v3 docs.
			return { redirectUrl: url.href() };
		}
	},
	{
		urls: ["https://docs.python.org/*"],
		types: ["main_frame"]
	},
	["blocking"]);
	
// Redirect back to the original if we get an error after the first redirect.
chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		var url = URI(details.url);
		if (details.statusCode > 400 && url.hasSearch("v_before")) {
			url
				.segment(0, (url.search(true))["v_before"])
				.removeSearch("v_before")
				.addSearch("redirect_fail", "1");
			chrome.tabs.update(details.tabId, {url: url.href()});
		}
	},
	{
		urls: ["https://docs.python.org/3/*"],
		types: ["main_frame"]
	});
	
// Remove cached files on install to ensure v2 docs aren't loaded from cache.
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.webRequest.handlerBehaviorChanged();
});