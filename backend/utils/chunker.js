class Chunker {
    constructor(chunkSize = 1000, overlap = 200) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }

    chunkText(text) {
        const chunks = [];
        const words = text.split(/\s+/);

        let currentChunk = [];
        let currentLength = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            currentChunk.push(word);
            currentLength += word.length + 1; // +1 for space

            if (currentLength >= this.chunkSize) {
                chunks.push({
                    text: currentChunk.join(' '),
                    start: Math.max(0, i - currentChunk.length),
                    end: i
                });

                // Keep overlap words for next chunk
                const overlapWords = Math.floor(this.overlap / 10); // Approximate word count
                currentChunk = currentChunk.slice(-overlapWords);
                currentLength = currentChunk.join(' ').length;
            }
        }

        // Add remaining words as final chunk
        if (currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.join(' '),
                start: Math.max(0, words.length - currentChunk.length),
                end: words.length
            });
        }

        return chunks;
    }

    chunkBySentences(text, sentencesPerChunk = 5) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];

        for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
            const chunkSentences = sentences.slice(i, i + sentencesPerChunk);
            chunks.push({
                text: chunkSentences.join(' ').trim(),
                start: i,
                end: Math.min(i + sentencesPerChunk, sentences.length)
            });
        }

        return chunks;
    }
}

module.exports = new Chunker();
