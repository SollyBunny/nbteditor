
const eNbtFileInput = document.getElementById("nbt-file");
const eNbtViewer = document.getElementById("nbt-viewer");

let nbtData = undefined;
let nbtName = undefined;

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

async function nbtSave() {
	const data = nbt.writeUncompressed(nbtData);
	download(data, nbtName, ".nbt");
}

function nbtParseData(data) {
	return new Promise((resolve, reject) => {
		nbt.parse(data, (error, data) => {
			if (error)
				reject(error);
			else
				resolve(data);
		});
	});
}

async function nbtFileInput(event) {
	const files = event.target.files;
	if (files.length === 0) return;
	nbtName = files[0].name;
	let data;
	data = await files[0].arrayBuffer();
	console.log(data);
	data = await nbtParseData(data);
	nbtData = data;
	for (const key in data.value) {
		const el = document.createElement("div");
		nbtViewerConstruct(el, key, data.value[key], 0);
		eNbtViewer.appendChild(el);
	}
}

async function nbtViewerConstruct(parent, name, data, depth, hideTypes) {
	parent.innerHTML = "";
	let title;
	if (data.type !== "compound") {
		{
			title = document.createElement("div");
			title.classList.add("title");
			title.textContent = name;
			title.title = name;
			parent.appendChild(title);
		}
		if (hideTypes !== true) {
			const types = document.createElement("select");
			for (let typeName of ["byte", "short", "int", "long", "float", "double", "string", "byteArray", "list", "compound"]) {
				const type = document.createElement("option");
				type.value = typeName;
				type.textContent = typeName;
				types.appendChild(type);
			}
			types.addEventListener("input", event => {
				data.type = event.target.value;
				nbtViewerConstruct(parent, name, data, depth);
			});
			if (data.type === "list")
				types.value = data.value.type;
			else
				types.value = data.type;
			parent.appendChild(types);
		}
	}
	switch (data.type) {
		case "byte": {
			const edit = document.createElement("input");
			edit.type = "number"
			edit.min = "-128";
			edit.max = "127";
			edit.step = "1";
			edit.value = data.value;
			edit.addEventListener("input", event => {
				data.value = parseInt(event.target.value) || 0;
			});
			parent.appendChild(edit);
			break;
		} case "short": {
			const edit = document.createElement("input");
			edit.type = "number"
			edit.min = "-32768";
			edit.max = "32767";
			edit.step = "1";
			edit.value = data.value;
			edit.addEventListener("input", event => {
				data.value = parseInt(event.target.value) || 0;
			});
			parent.appendChild(edit);
			break;
		} case "int": {
			const edit = document.createElement("input");
			edit.type = "number"
			edit.min = "-2147483648";
			edit.max = "2147483647";
			edit.step = "1";
			edit.value = data.value;
			edit.addEventListener("input", event => {
				data.value = parseInt(event.target.value) || 0;
			});
			parent.appendChild(edit);
			break;
		} case "long": {
			const edit = document.createElement("input");
			edit.type = "string"
			edit.value = (BigInt(data.value[0] >>> 0) << 32n) + BigInt(data.value[1] >>> 0);
			edit.addEventListener("input", event => {
				event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
				const val = BigInt(event.target.value);
				const mask = 1n << 32n;
				const val1 = (val / mask) & (mask - 1n);
				const val2 = (val % mask) & (mask - 1n);
				data.value[0] = parseInt(val1);
				data.value[1] = parseInt(val2);
				event.target.value = (val1 << 32n) + val2;
			});
			parent.appendChild(edit);
			break;
		} case "float": case "double": {
			const edit = document.createElement("input");
			edit.type = "number"
			edit.value = data.value;
			edit.addEventListener("input", event => {
				data.value = parseFloat(event.target.value);
			});
			parent.appendChild(edit);
			break;
		} case "string": {
			const edit = document.createElement("textarea");
			edit.textContent = data.value;
			edit.addEventListener("input", event => {
				data.value = event.target.value;
			});
			parent.appendChild(edit);
			break;
		} case "byteArray": {
			const edit = document.createElement("textarea");
			edit.textContent = data.value;
			edit.addEventListener("input", event => {
				data.value = event.target.value.split(",");
			});
			parent.appendChild(edit);
			break;
		} case "compound": {
			const content = document.createElement("div");
			content.classList.add("compound");
			content.classList.add("arrow");
			content.textContent = name;
			content.title = name;
			const children = document.createElement("div");
			children.classList.add("compound-children");
			children.setAttribute("depth", depth);
			children.style.display = "none";
			content.addEventListener("click", event => {
				if (event.target.isInit !== true) {
					event.target.isInit = true;
					event.target.isOpen = false;
					for (const key in data.value) {
						const el = document.createElement("div");
						nbtViewerConstruct(el, key, data.value[key], depth + 1);
						children.appendChild(el);
					}
				}
				if (event.target.isOpen === false) {
					event.target.isOpen = true;
					content.classList.add("open");
					children.style.display = "grid";
					window.setTimeout(() => {
						children.style.clipPath = "rect(0 100% 100% 0)";
					}, 2);
				} else {
					event.target.isOpen = false;
					content.classList.remove("open");
					children.style.clipPath = "rect(0 100% 0% 0)";
					window.setTimeout(() => {
						children.style.display = "none";
					}, 200);
				}
			});
			parent.appendChild(content);
			parent.appendChild(children);
			break;
		} case "list": {
			title.classList.add("arrow");
			const children = document.createElement("div");
			children.classList.add("compound-children");
			children.classList.add("list-children");
			children.setAttribute("depth", depth);
			children.style.display = "none";
			console.log(data, data.value.type)
			title.addEventListener("click", event => {
				if (event.target.isInit !== true) {
					event.target.isInit = true;
					event.target.isOpen = false;
					for (let key = 0; key < data.value.value.length; ++key) {
						const el = document.createElement("div");
						nbtViewerConstruct(
							el, key, {
								type: data.value.type,
								value: data.value.value[key],
							}, 
							depth + 1, true
						);
						children.appendChild(el);
					}
				}
				if (event.target.isOpen === false) {
					event.target.isOpen = true;
					title.classList.add("open");
					children.style.display = "grid";
					window.setTimeout(() => {
						children.style.clipPath = "rect(0 100% 100% 0)";
					}, 2);
				} else {
					event.target.isOpen = false;
					title.classList.remove("open");
					children.style.clipPath = "rect(0 100% 0% 0)";
					window.setTimeout(() => {
						children.style.display = "none";
					}, 200);
				}
			});
			const dummy = document.createElement("div");
			parent.appendChild(dummy);
			parent.appendChild(children);
			break;
		}
		default:
			const content = document.createElement("div");
			content.textContent = `${data.type}: ${data.value}`;
			parent.appendChild(content);
	}
}

eNbtFileInput.addEventListener("change", nbtFileInput, false);