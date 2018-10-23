function insert_option(opt_group_el, link_el) {
	// Get the url section relevant to the version redirection.
	var val = (new URL(link_el.href)).pathname;
	// Remove the leading and trailing /.
	if (val.startsWith('/'));
		val = val.substring(1, val.length);
	if (val.endsWith('/'));
		val = val.substring(0, val.length-1);
	// Get the version text.
	var text = link_el.innerHTML;
	// Trim the "Python " before the version name, as it would just be useless information.
	if (text.startsWith("Python "))
		text = text.substring(7);
	else
		// If there is no "Python " in the start, it's a dynamic URL and we give it a more specific name.
		text = "Latest Python " + val;	// The dynamic 
	// Create the option element.
	var opt_el = document.createElement("option");
	opt_el.value = val;
	opt_el.innerHTML = text;
	opt_group_el.appendChild(opt_el);
}

// Dynamically load all versions from a Python documentation page.
function load_versions() {
	// AJAX the Python documentation's versions page.
	var xhr = new XMLHttpRequest();
	xhr.responseType = "document";
	xhr.open("GET", "https://www.python.org/doc/versions/");
	xhr.onreadystatechange = (e) => {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// Get the static versions from the AJAX'ed page.
				var py3_versions = xhr.response.querySelectorAll("#python-documentation-by-version li>a[href^=\"http://docs.python.org/release/3\"]");
				var py2_versions = xhr.response.querySelectorAll("#python-documentation-by-version li>a[href^=\"http://docs.python.org/release/2\"]");
				var py1_versions = xhr.response.querySelectorAll("#python-documentation-by-version li>a[href^=\"http://docs.python.org/release/1\"]");
				var dyn_versions = xhr.response.querySelectorAll("#in-development-versions li>a[href^=\"http://docs.python.org/\"]");
				// Get the respective option groups.
				var py3_options_el = document.getElementById("opts-py3");
				var py2_options_el = document.getElementById("opts-py2");
				var py1_options_el = document.getElementById("opts-py1");
				var dyn_options_el = document.getElementById("opts-dyn");
				// Insert the options
				py3_versions.forEach((el) => insert_option(py3_options_el, el));
				py2_versions.forEach((el) => insert_option(py2_options_el, el));
				py1_versions.forEach((el) => insert_option(py1_options_el, el));
				dyn_versions.forEach((el) => insert_option(dyn_options_el, el));
				// Unhide options.
				dyn_options_el.parentNode.classList.remove("hidden");
				document.getElementById("loading_msg").classList.add("hidden");
				restore_options();
				// Enable the save button.
			}
			else {
				// Show an error message, because loading failed.
				var error_msg_el = document.createElement("div");
				error_msg_el.id = "error_msg";
				error_msg_el.innerHTML = "Could not retrieve the version list.";
				var loading_msg_el = document.getElementById("loading_msg");
				loading_msg_el.parentNode.insertBefore(error_msg_el, loading_msg_el);
				loading_msg_el.parentNode.remove(loading_msg_el);
			}
		}
	};
	xhr.send();
	// Restore the previous options.
}

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


document.addEventListener('DOMContentLoaded', () => {
	load_versions();
	document.getElementById('version').addEventListener('change', save_options);
});
