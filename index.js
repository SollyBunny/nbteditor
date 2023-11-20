
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
		nbtViewerConstruct(eNbtViewer, key, data.value[key]);
	}
}

async function nbtViewerConstruct(parent, name, data) {
	{
		const title = document.createElement("div");
		title.classList.add("title");
		title.textContent = name;
		parent.appendChild(title);
		if (data.type === "compound") {
			const content = document.createElement("div");
			content.textContent = "Click to drop down";
			const button = document.createElement("button");
			button.textContent = "Drop Down";
			const children = document.createElement("div");
			children.classList.add("compound-children");
			button.addEventListener("click", event => {
				if (event.target.isInit !== true) {
					event.target.isInit = true;
					event.target.isOpen = false;
					for (const key in data.value) {
						nbtViewerConstruct(children, key, data.value[key]);
					}
				}
				if (event.target.isOpen === false) {
					event.target.isOpen = true;
					children.style.display = "block";
					children.style.clipPath = "rect(0 100% 100% 0)";
				} else {
					event.target.isOpen = false;
					children.style.clipPath = "rect(0 100% 0% 0)";
					window.setTimeout(() => {
						children.style.display = "none";
					}, 200);
				}
			});
			content.appendChild(button);
			parent.appendChild(content);
			parent.appendChild(children);
			return;
		} else {
			const types = document.createElement("select");
			for (let typeName of ["byte", "short", "int", "long", "float", "double", "string"]) {
				const type = document.createElement("option");
				type.value = typeName;
				type.textContent = typeName;
				types.appendChild(type);
			}
			types.addEventListener("input", event => {
				data.type = event.target.value;
			});
			types.value = data.type;
			parent.appendChild(types);
		}
	}
	{
		let content;
		switch (data.type) {
			case "byte": {
				content = document.createElement("div");
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-128";
				edit.max = "127";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value) || 0;
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "short": {
				content = document.createElement("div");
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-32768";
				edit.max = "32767";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value) || 0;
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "int": {
				content = document.createElement("div");
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-2147483648";
				edit.max = "2147483647";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value) || 0;
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "long": {
				content = document.createElement("div");
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
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "float": case "double": {
				content = document.createElement("div");
				const edit = document.createElement("input");
				edit.type = "number"
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseFloat(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "string": {
				content = document.createElement("div");
				const edit = document.createElement("input");
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = event.target.value;
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			}
			default:
				content = document.createElement("div");
				content.textContent = `${data.type}: ${data.value}`;
				parent.appendChild(content);
		}
	}
}

eNbtFileInput.addEventListener("change", nbtFileInput, false);