class Citations {
    // Format citation in APA style
    formatCitation(source, chunkIndex, pageNumber = null) {
        const parts = [];

        if (source) {
            parts.push(source);
        }

        if (pageNumber) {
            parts.push(`p. ${pageNumber}`);
        } else if (chunkIndex !== undefined) {
            parts.push(`chunk ${chunkIndex}`);
        }

        return parts.join(', ');
    }

    // Create citation object
    createCitation(document, chunk) {
        return {
            id: chunk.id,
            source: document.filename,
            document_id: document.id,
            chunk_index: chunk.chunk_index,
            page_number: chunk.page_number,
            content_preview: chunk.content.substring(0, 100) + '...',
            formatted: this.formatCitation(document.filename, chunk.chunk_index, chunk.page_number)
        };
    }

    // Group citations by source
    groupBySource(citations) {
        const grouped = {};

        citations.forEach(citation => {
            const source = citation.source || 'Unknown';
            if (!grouped[source]) {
                grouped[source] = [];
            }
            grouped[source].push(citation);
        });

        return grouped;
    }

    // Generate bibliography
    generateBibliography(citations) {
        const sources = new Set(citations.map(c => c.source));
        return Array.from(sources).sort().map((source, index) => ({
            number: index + 1,
            source,
            citation_count: citations.filter(c => c.source === source).length
        }));
    }
}

module.exports = new Citations();
