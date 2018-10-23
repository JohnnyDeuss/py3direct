function getPageVersion() {
	var versionSelector = document.querySelector(".version_switcher_placeholder>select");
	if (versionSelector === null)
		return null;
	return versionSelector.options[versionSelector.selectedIndex].text;
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
	chrome.storage.sync.get("version", function(items) {
		var pageVersion = getPageVersion();
		if (pageVersion !== null) {
			var failMessage = createFailMessage(items.version, pageVersion);
			insertFailMessage(failMessage);
		}
	});
})();
