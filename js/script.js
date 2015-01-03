/* Variavel Global */
var destino = "";

/* Ação teclas */
function onClickHandler(info, tab) {
	chrome.storage.sync.get('valores', function(items) {
		items.valores.forEach(function(arrayObjetos) {		
			if(info.menuItemId == arrayObjetos['nome']) {
				destino = arrayObjetos['caminho'];
				getSuggestName();
				getClickHandler(info.srcUrl);
				return;
			}
		});
	});
};

/* Função Salva Imagem */
function getClickHandler(url) {
	chrome.downloads.download({ 
		url: url,
		conflictAction: "prompt",
		saveAs: false
	});	
};

/* Listener */
chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.storage.onChanged.addListener(atualizaInterface);

function getSuggestName() {
	chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
		suggest({ 
			filename: destino + item.filename,
			conflictAction: "prompt"
		});
	});
}

/* Interface */
chrome.runtime.onInstalled.addListener(function() {	
	chrome.contextMenus.create({
		"title" : "Diretorio(s)",
		"contexts" : ["image"],
		"id" : "parent"
	});
	
	atualizaInterface();
});

function atualizaInterface() {
	chrome.storage.sync.get('valores', function(itens) {
		itens.valores.forEach(function(arrayObjetos) {
			if(arrayObjetos['ativo'] == true) {
				chrome.contextMenus.create({
					"title" : arrayObjetos['nome'], 
					"contexts" : ["image"],
					"parentId" : "parent", 
					"id" : arrayObjetos['nome']
				});
			}
		});
	});
}