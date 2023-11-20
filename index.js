
const eNbtFileInput = document.getElementById("nbt-file");
const eNbtViewer = document.getElementById("nbt-viewer");

function isObject(a) {
	return (!!a) && (a.constructor === Object);
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
	let data;
	data = await files[0].arrayBuffer();
	console.log(data);
	data = await nbtParseData(data);
	window.data = data;
	nbtViewerConstruct(eNbtViewer, undefined, {
		type: "compound",
		value: data.value
	}, true);
	
}

async function nbtViewerConstruct(parent, name, data) {
	const root = name === undefined;
	if (!root) {
		const title = document.createElement("div");
		title.classList.add("title");
		title.textContent = name;
		parent.appendChild(title);
	}
	{
		let content;
		switch (data.type) {
			case "byte": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-128";
				edit.max = "127";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "short": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-32768";
				edit.max = "32767";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "int": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-2147483648";
				edit.max = "2147483647";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "long": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.type = "number"
				edit.min = "-9223372036854775808";
				edit.max = "-9223372036854775807";
				edit.step = "1";
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "float": case "double": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.type = "number"
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "string": {
				content = document.createElement("div");
				content.textContent = `${data.type}`;
				const edit = document.createElement("input");
				edit.value = data.value;
				edit.addEventListener("input", event => {
					data.value = parseInt(event.target.value);
				});
				content.appendChild(edit);
				parent.appendChild(content);
				break;
			} case "compound":
				if (root) {
					for (const key in data.value) {
						nbtViewerConstruct(parent, key, data.value[key]);
					}
				} else {
					content = document.createElement("div");
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
					content.appendChild(children);
					parent.appendChild(content);
				}
				break;
			default:
				content = document.createElement("div");
				content.textContent = `${data.type}: ${data.value}`;
				parent.appendChild(content);
		}
	}
}

eNbtFileInput.addEventListener("change", nbtFileInput, false);