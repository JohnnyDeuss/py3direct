function getPageVersion() {
	var versionSelector = document.querySelector(".version_switcher_placeholder>select");
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

(function show_redirect_fail() {
	chrome.storage.sync.get("version", function(items) {
		var pageVersion = getPageVersion();
		var failMessage = createFailMessage(items.version, pageVersion);
		insertFailMessage(failMessage);
	});
})();
