var version = "3";		// Dummy until we get the actual value from storage.

// URL rewriting.
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var url = new URL(details.url);
		// No previous redirection failure, hasn't been redirected from a different version.
		if (!url.searchParams.has("redirect_fail") && !url.searchParams.has("v_before")) {
			// There are two docs formats, in the long format the version is in the second segment, not the first.
			// docs.python.org/<version>/* and docs.python.org/release/<version>/*
			segments = url.pathname.split("/");
			if (segments[1] == "release")
				segments.splice(1,1);
			// If the first segment matches with a version string and is not the redirection version.
			if (segments[1].match(/dev|\d+(?:\.\d+)*(?:p\d)?/) && segments[1] != version) {
				// Keep original version in query string.
				url.searchParams.append("v_before", segments[1]);
				// Change to version selected in the options.
				segments[1] = version;
				url.pathname = segments.join("/")
			}
			return { redirectUrl: url.href };
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
		var url = new URL(details.url);
		if (details.statusCode > 400 && url.searchParams.has("v_before")) {
			// There are two docs formats, in the long format the version is in the second segment, not the first.
			// docs.python.org/<version>/* and docs.python.org/release/<version>/*
			segments = url.pathname.split("/");
			if (segments[1] == "release")
				segments.splice(1,1);
			segments[1] = url.searchParams.get("v_before");
			url.pathname = segments.join("/");
			url.searchParams.delete("v_before");
			url.searchParams.append("redirect_fail", "1");
			return { redirectUrl: url.href };
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
	  
// Because the onBeforeRequest event is blocking, and because JavaScript doesn't
// do synchronous code very well. We keep track of settings by keeping it in
// memory and updating it with events.
chrome.storage.sync.get("version", function(items) { version = items.version; });
// Keeping the version number up to date
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if ("version" in changes)
		version = changes.version.newValue;
});
