document.addEventListener('DOMContentLoaded', async function() {
	
	const contentPanel = document.getElementById('panel-content');
	const titlePanel = document.getElementById('panel-title');
		
	try{
		const response = await fetch('data.json');
		const explorerData = await response.json();
		
		const globalExcerpts = explorerData.excerpts || {};
		const graphElements = explorerData.elements || [];
		
		const processedElements = graphElements.map(element=> {
			if ( element.data && element.data.source && element.data.target ) {
				const isBi = element.data.direction === 'bi';
				const separator = isBi? '<->' : '->' ;
				const edgeId = element.data.id || `${element.data.source}${separator}${element.data.target}`;
				const updatedData = {
					...element.data,
					id:edgeId
				};
				if (isBi) {
					updatedData.elk = {
						...element.data.elk,
						'org.eclipse.elk.edgeRouting.directed':false
					};
				}
				
				return {
					...element,
					data:updatedData
				}
			}
			
			return element;
			
		});
		
		const cy = cytoscape( {
			container:document.getElementById('cy'),
			elements: processedElements,
			style: [
				{ selector:'node', style: { 'background-color':'#4c6ef5', 'label':'data(label)', 
				                            'font-size':'13px', 'font-weight':'bold',
                                            'text-valign':'center', 'text-halign':'center',
                                            'text-wrap':'wrap', 'text-max-width':'120px',
											'width':'140px', 'height':'60px' } },
				{ selector:'edge', style: {'width':2, 'line-color':'#999', 'curve-style':'bezier',
                                           'target-arrow-shape':'triangle', 'target-arrow-color':'#999'	} },
				{ selector:'edge[direction="bi"]', style: {'source-arrow-shape':'triangle', 'source-arrow-color':'#999'} },
				
				{ selector:'node.observation', style: { 'background-color':'#f59f00', 'shape':'ellipse' } },
				{ selector:'node.identity', style: { 'background-color':'#37b24d', 'shape':'rectangle' } },
				{ selector:'node.response', style: { 'background-color':'#f03e3e', 'shape':'tag',
                                                     'width':'150px', 'height':'50px', 'text-margin-x':'-8px' } },
				
				{ selector:'node:selected', style: { 'border-width':'4px', 'border-color':'#15aabf' } }
				],
			layout:{
				name:'elk',
				animate:true,
				animationDuration:500,
				elk:{
					algorithm:'layered',
					'elk.direction':'RIGHT',
					'org.eclipse.elk.layered.partitioning.activate':true,
					'elk.spacing.nodeNode':40,
					'elk.spacing.componentComponent':60,
					'elk.edgeRouting':'SPLINES'
				},
				nodeDimensionsIncludeLabels:true,
				
				nodeLayoutOptions:function(node){
					let partitionLayer = 1;
					if (node.hasClass('observation')) {
						partitionLayer = 0;
					} else if (node.hasClass('response')) {
						partitionLayer = 2;
					}
					return {'org.eclipse.elk.layered.partitioning.partition':partitionLayer};
				}
			}
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