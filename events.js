var version = "3";		// Dummy until we get the actual value from storage.

// URL rewriting.
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var url = URI(details.url);
		// No previous redirection failure, hasn't been redirected from a different version.
		if (!url.hasSearch("redirect_fail") && !url.hasSearch("v_before")) {
			// There are two docs formats, in the long format the version is in the second segment, not the first.
			// docs.python.org/<version>/* and docs.python.org/release/<version>/*
			if (url.segment(0) == "release")
				url.segment(0, "");
			if (url.segment(0).match(/dev|\d+(?:\.[\dp]+)*/) && url.segment(0) != version) {
				url
						.addSearch("v_before", url.segment(0))		// Keep original version in query string.
						.segment(0, version);							// Change to different version.
			}
			return { redirectUrl: url.href() };
		}
	},
	{
		urls: ["https://docs.python.org/*"],
		types: ["main_frame"]
	},
	["blocking"]);
	
// Redirect back to the original if we get an error after the first redirect.
chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var url = URI(details.url);
		if (details.statusCode > 400 && url.hasSearch("v_before")) {
			url
					.segment(0, (url.search(true))["v_before"])
					.removeSearch("v_before")
					.addSearch("redirect_fail", "1");
			return { redirectUrl: url.href() };
		}
	},
	{
		urls: ["https://docs.python.org/*"],
		types: ["main_frame"]
	},
	["blocking"]);

chrome.runtime.onInstalled.addListener(function(details) {
	// Remove cached files on install to ensure v2 docs aren't loaded from cache.
	chrome.webRequest.handlerBehaviorChanged();
	// Set v3 as default.
	chrome.storage.sync.get({version: "3"}, function(items) {
		chrome.storage.sync.set({version: items.version});
	});
});
	  
// Because the onBeforeRequest event is blocking, and because
// JavaScript doesn't do synchronous code very well. We keep
// track off settings by keeping it in memory and updating it
// with events. If only there was an await to do blocking calls.
chrome.storage.sync.get("version", function(items) { version = items.version; });
// Keeping the version number up to date
chrome.storage.onChanged.addListener(function(changes, namespace) {
		if ("version" in changes)
			version = changes.version.newValue;
	});

// Open settings as browserAction
chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.runtime.openOptionsPage();
	});