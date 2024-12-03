const LMStudioClient = require("@lmstudio/sdk").LMStudioClient;

const lmstudio = new LMStudioClient();

async function main() {
    let result;
    try {
        result = await lmstudio.embedding.get('text-embedding-nomic-embed-text-v1.5');
    } catch (e) {
        result = await lmstudio.embedding.load('text-embedding-nomic-embed-text-v1.5')
    }

    //const result = await llama3.complete("# A function to print the digits of pi\ndef print_pi():");
    const emb = await result.embedString('hello world');
    console.log(emb);
    //   console.log(result.content);
    //   console.log(result.stats);
    await lmstudio.embedding.unload('text-embedding-nomic-embed-text-v1.5');
}

main();