$(function() {
	$('#btnAdicionar').bind('click', function(e) {
		$('#element_to_pop_up').bPopup({
			speed: 650,
			transition: 'slideIn',
			transitionClose: 'slideBack',
			modalColor: 'gray'
		});
	});
			
	$('#btnCancelar').bind('click', function(e) {
		$('#element_to_pop_up').bPopup().close();
	});
			
	$('#btnOk').bind('click', function(e) {
		var nome = document.getElementById('txtNome').value;
		var caminho = document.getElementById('txtCaminho').value;
		console.log('Validando Nome e Caminho');
		
		if(nome && caminho) {
			console.log('Nome e Caminho - OK');
			console.log('Recebendo dados dos itens');
			
			chrome.storage.sync.get('valores', function(itens) {		
				console.log('Dados recebidos');
				
				if(itens.valores != null) {						
					console.log('Verificando se o item já existe');
					
					itens.valores.forEach(function(arrayObjetos) {
						if(arrayObjetos['nome'] == nome) {	
							console.log('Já existe um item com esse nome');
							alert('Já existe um item com esse nome!');
							return;
						}
					});
				}
				
				console.log('Exibindo campos');
				$('.CSSTableGenerator tr:last').after(
					'<tr>' +
						'<td id="valueNome">' 		+ nome + 	'</td>' + 
						'<td id="valueCaminho">' 	+ caminho + '</td>' +
						'<td class="alignCenter"><input id="valueAtivo" type="checkbox" checked /></td>' +
						'<td class="alignCenter">' +
							'<img id="btnUpRank" class="cursorPointer" src="/image/up-icon.png"></img>' +
							'<img id="btnDownRank" class="cursorPointer" src="/image/down-icon.png"></img>' +
							'<img id="btnDelete" class="cursorPointer" src="/image/icon-delete.png"></img>' +
						'</td>' +
					'</tr>'
				);
			
				save_options();
				$('#element_to_pop_up').bPopup().close();
			});
		} else {
			console.log('Preencha o Nome e o Caminho');
			alert('Preencha o Nome e o Caminho.');
		}
	});
		
	$('#btnAtualizar').bind('click', function(e) {
		location.reload();
	});
		
	$('#grid').on('click','#btnDelete', function() {
		var retorno = confirm('Deseja excluir o registro?');
		
		if(retorno == true) {
			var td = $(this).parent();
			var tr = td.parent();
			tr.css("background-color","#FF3700");

			tr.fadeOut(400, function(){
				tr.remove();
				save_options();
				atualizaInterface();
				// chrome.contextMenus.remove($(this).find('#valueNome').html(), function() {});				
			});
		}
	});
	
	$('#grid').on('click','#valueAtivo', function() {
		// chrome.contextMenus.remove($(this).parent().parent().find('#valueNome').html(), function() {});
		save_options();
		atualizaInterface();
	});
	
	$('#grid').on('click','#btnUpRank', function() {
		var row = $(this).parent().parent();
		var previous = row.prev();
 
		if (previous.is("tr") && previous.children().next('.alignCenter').attr('class') == 'alignCenter') {
			row.detach();
			previous.before(row);
	 
			row.fadeOut();
			row.fadeIn();
			
			save_options();
			atualizaInterface();
		}
	});
	
	$('#grid').on('click','#btnDownRank', function() {
		var row = $(this).parent().parent();
		var previous = row.next();
 
		if (previous.is("tr")) {
			row.append();
			previous.after(row);
	 
			row.fadeOut();
			row.fadeIn();
			
			save_options();
			atualizaInterface();
		}
	});
});

//document.getElementById('btnAdicionar').addEventListener('click', save_options);

function save_options() {
	var dados = new Array();
	var i = 0;
	$('.CSSTableGenerator tr').each( function(index, value) {
		if(index != 0) {
			dados[i] = new Array(3);
			dados[i] = {
				'nome': $(this).find('#valueNome').html(),
				'caminho': $(this).find('#valueCaminho').html(),
				'ativo': $(this).find('#valueAtivo').prop('checked')
			};
			i++;
		}
	});

	chrome.storage.sync.set({valores: dados}, function() {
		var status = document.getElementById('status');
		status.textContent = 'Configuração Salva.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
};

document.addEventListener('DOMContentLoaded', restore_options);

function restore_options() {
	chrome.storage.sync.get('valores', function(itens) {
		itens.valores.forEach(function(arrayObjetos) {
			$('.CSSTableGenerator tr:last').after(
				'<tr>' +
					'<td id="valueNome">'		+ arrayObjetos['nome'] + '</td>' +
					'<td id="valueCaminho">'	+ arrayObjetos['caminho'] + '</td>' +
					'<td class="alignCenter"><input id="valueAtivo" type="checkbox" ' + ((arrayObjetos['ativo'] == true) ? 'checked' : '') + '></td>' +
					'<td class="alignCenter">' +
						'<img id="btnUpRank" class="cursorPointer" src="/image/up-icon.png"></img>' +
						'<img id="btnDownRank" class="cursorPointer" src="/image/down-icon.png"></img>' +
						'<img id="btnDelete" class="cursorPointer" src="/image/icon-delete.png"></img>' +
					'</td>' +
				'</tr>'
			);
		});
	});
}

document.getElementById('btnReset').addEventListener('click', remove_options);

function remove_options() {
	var retorno = confirm('Deseja excluir todos os registros?');
	console.log('Confirmação de exclusão');

	if(retorno == true) {
		console.log('Exclusão confirmada');
		
		chrome.storage.sync.get('valores', function(itens) {
			itens.valores.forEach(function(arrayObjetos) {
				chrome.contextMenus.remove(arrayObjetos['nome']);
			});
		});
		
		chrome.storage.sync.remove('valores', function(itens) {
			console.log('Registros removidos');
			console.log('Atualizando página');
			location.reload();
		});
	}
}

function atualizaInterface() {
	
	chrome.contextMenus.removeAll();
	
	chrome.contextMenus.create({
		"title" : "Diretorio(s)",
		"contexts" : ["image"],
		"id" : "parent"
	});

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