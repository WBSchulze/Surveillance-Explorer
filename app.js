document.addEventListener('DOMContentLoaded', async function() {
	const contentPanel = document.getElementById('panel-content');
	const titlePanel = document.getElementById('panel-title');
	
	try{
		const response = await fetch('data.json');
		const graphData = await response.json()
		
		const cy = cytoscape( {
			container:document.getElementById('cy'),
			elements: graphData,
			style: [
				{ selector:'node', style: { 'background-color':'#4c6ef5', 'label':'data(label)' } },
				{ selector:'edge', style: {'width':3, 'line-color':'#ced4da', 'curve-style':'bezier' } }
				],
		layout:{name:'cose', padding:50} 
		});
		
		cy.on('tap', 'node', function(evt) {
			const metadata = evt.target.data();
			titlePanel.innerText = metadata.label || `Node: ${metadata.id}`;
			
			let htmlContent='';
			Object.keys(metadata).forEach(key=> {
				if (!['id', 'label'].includes(key)) {
					htmlContent += `
					<div class="metadata-label">${key}</div>
					<div class="metadata-value">${metadata[key]}</div>
					`;
				}
			});
			contentPanel.innerHTML = htmlContent;
		});
		
		cy.on('tap', function(evt) {
			if (evt.target === cy) {
				titlePanel.innerText = "Node Inspector";
				contentPanel.innerHTML = '<p class="placeholder-text">Click on a vertex for more information."</p>';
			}
		});
		
	} catch (error) {
		console.error("Error loading graph data:", error);
		contentPanel.innerHTML = '<p class="placeholder-text" style="color:red;">Failed to load graph data.</p>';
	}
});