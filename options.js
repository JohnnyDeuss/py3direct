// Saves options to chrome.storage.
function save_options() {
	var version = document.getElementById('version').value;
	var feedback = document.getElementById('save_feedback');
	feedback.innerHTML = "Saving...";
	feedback.className = "";
	chrome.storage.sync.set({version: version}, function() {
			// Give user feedback.
			feedback.innerHTML = "Options saved.";
			feedback.className = "saved";
			setTimeout(function() {
					feedback.className = "fading";
				}, 1500);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value v3.
	chrome.storage.sync.get("version", function(items) {
			document.getElementById('version').value = items.version;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('cancel').addEventListener('click', restore_options);