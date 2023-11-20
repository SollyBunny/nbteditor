
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
	data = await nbtParseData(data);
	window.data = data;
	nbtViewerConstruct(eNbtViewer, undefined, {
		type: "compound",
		value: data.value
	}, true);
	
}

async function nbtViewerConstruct(parent, name, data) {
	const root = name === undefined;
	let el;
	if (!root) {
		const title = document.createElement("div");
		title.classList.add("title");
		title.textContent = name;
		el.appendChild(title);
	}
	{
		let content;
		switch (data.type) {
			case "compound":
				const children = document.createElement("div");
				children.classList.add("compound-children");
				if (root) {
					for (const key in data.value) {
						nbtViewerConstruct(children, key, data.value[key]);
					}
				} else {
					content = document.createElement("button");
					content.classList.add("compound");
					content.textContent = "Click to drop down";
					el.appendChild(content);
					content.addEventListener("click", event => {
						for (const key in data.value) {
							nbtViewerConstruct(children, key, data.value[key]);
						}
					});
				}
				el.appendChild(children);
				break;
			default:
				content = document.createElement("div");
				content.textContent = `${data.type}: ${data.value}`;
				parent.appendChild(content);
		}
	}
}

eNbtFileInput.addEventListener("change", nbtFileInput, false);