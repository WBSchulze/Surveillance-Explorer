document.addEventListener('DOMContentLoaded', async function() {
	const contentPanel = document.getElementById('panel-content');
	const titlePanel = document.getElementById('panel-title');
	
	try{
		const response = await fetch('data.json');
		const explorerData = await response.json();
		
		const globalExcerpts = explorerData.excerpts || {};
		const graphElements = explorerData.elements || [];
		
		const cy = cytoscape( {
			container:document.getElementById('cy'),
			elements: graphElements,
			style: [
				{ selector:'node', style: { 'background-color':'#4c6ef5', 'label':'data(label)' } },
				{ selector:'edge', style: {'width':3, 'line-color':'#ced4da', 'curve-style':'bezier' } },
				
				{ selector:'node.observation', style: { 'background-color':'#f59f00', 'shape':'ellipse' } },
				{ selector:'node.identity', style: { 'background-color':'#37b24d', 'shape':'rectangle' } },
				{ selector:'node.response', style: { 'background-color':'#f03e3e', 'shape':'triangle' } },
				
				{ selector:'node:selected', style: { 'border-width':'4px', 'border-color':'#15aabf' } }
				],
		layout:{name:'cose', padding:50} 
		});
		
		cy.on('tap', 'node', function(evt) {
			const metadata = evt.target.data();
			titlePanel.innerText = metadata.label || `Node: ${metadata.id}`;
			
			let htmlContent=`
			<div class="metadata-label">Description</div>
			<div class="metadata-value">${metadata.description || 'No description provided.'}</div>
			`;
			
			if ( metadata.references && metadata.references.length > 0 ) {
				htmlContent += `<div class="excerpt-accordion">`;
				htmlContent += `<div class="metadata-label">Referenced Excerpts</div>`;
				
				metadata.references.forEach(tokenName => {
					const excerptObj = globalExcerpts[tokenName];
					
					if (excerptObj) {
						const displayTitle = excerptObj.title || tokenName;
						const paragraphText = excerptObj.text || 'No text content provided.';
						const sourceUrl = excerptObj.url || '';
						
						let linkHtml = '';
						if (sourceUrl) {
							linkHtml = `
							<div class="excerpt-link-wrapper">
								<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">
									View Source Documentation
								</a>
							</div>
							`;
						}
						htmlContent += `
						<details class="excerpt-item">
							<summary>${displayTitle}</summary>
							<div class="excerpt-body">
								<p>${paragraphText}</p>
								${linkHtml}
							</div>
						</details>
						`;
					}
				});
				htmlContent += `</div>`;
			}
			
			contentPanel.innerHTML = htmlContent;
		});

		cy.on('tap', function(evt) {
			if (evt.target === cy) {
				titlePanel.innerText = "Node Inspector";
				contentPanel.innerHTML = `<p class="placeholder-text">Click on a vertex for more information.</p>`;
			}
		});
		
	} catch (error) {
		console.error("Error loading graph data:", error);
		contentPanel.innerHTML = `<p class="placeholder-text" style="color:red;">Failed to load graph data.</p>`;
	}
});