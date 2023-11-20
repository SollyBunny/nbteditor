
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
	let data = await files[0].arrayBuffer();
	let nbt = await nbtParseData(data);
	nbtViewerConstruct(eNbtViewer, nbt);
}

async function nbtViewerConstruct(parent, nbt) {
	const el = document.createElement("div");
	el.classList.add("")
	{
		const title = document.createElement("div");
		title.textContent = nbt.name;
		el.appendChild(title);
	}
	{
		const data = document.createElement("div");
		if (isObject(nbt.value)) {
			
		}
		el.appendChild(data);
	}
	parent.appendChild(el);
}

eNbtFileInput.addEventListener("change", nbtFileInput, false);