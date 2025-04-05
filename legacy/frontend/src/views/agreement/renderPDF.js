pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function renderPDFPage(pageNumber, node, width, height) {
  pdfjs.getDocument(node.src).promise.then((pdf) => {
    pdf.getPage(pageNumber).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas'); // Create a new canvas
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);
      node.appendChild(canvas); // Append the new canvas to the node element
    });
  });
}
