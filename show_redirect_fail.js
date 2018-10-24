function getPageVersion() {
	var url = new URL(window.location.href);
	segments = url.pathname.split("/");
	if (segments[1] == "release")
		return segments[2];
	else
		return segments[1];
}

function createFailMessage(preferredVersion, pageVersion) {
	var failMessage = document.createElement("div");
	failMessage.className = "deprecated admonition";
	failMessage.innerHTML = '<p class="first admonition-title">(py3direct)</p>\
			<p class="last">This docs page does not exist for your preferred version <em>(' + preferredVersion + ")</em>!\
			Showing the version you originally clicked on instead <em>(" + pageVersion +")</em>.";
	return failMessage;
}

function insertFailMessage(failMessage) {
	var firstSection = document.querySelector(".body>.section");
	var afterHeader = firstSection.querySelector("h1+*");
	firstSection.insertBefore(failMessage, afterHeader);
}

(function showRedirectFail() {
	// Detect which browser API to use.
	if (chrome)
		browser = chrome;
	else {
		// Make the storage API consistent.
		browser.storage.sync._get = browser.storage.sync.get;
		browser.storage.sync.get = (keys, callback) => {
			let gettingItem = browser.storage.sync._get(keys);
			gettingItem.then(callback);
		}
	}

	browser.storage.sync.get("version", function(items) {
		var pageVersion = getPageVersion();
		if (pageVersion !== null) {
			preferredVersion = items.version;
			if (items.version.startsWith("release/"))
				preferredVersion = preferredVersion.substring(8, preferredVersion.length);
			var failMessage = createFailMessage(preferredVersion, pageVersion);
			insertFailMessage(failMessage);
		}
	});
})();
