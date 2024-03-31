import { cleanUrl } from "@/libs/clean-url"
import { chromeRunTime } from "@/libs/runtime"
import { PageAssistHtmlLoader } from "@/loader/html"
import {
  defaultEmbeddingChunkOverlap,
  defaultEmbeddingChunkSize,
  defaultEmbeddingModelForRag,
  getOllamaURL
} from "@/services/ollama"
import {
  getIsSimpleInternetSearch,
  totalSearchResults
} from "@/services/search"
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama"
import type { Document } from "@langchain/core/documents"
import * as cheerio from "cheerio"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

export const localDuckDuckGoSearch = async (query: string) => {
  await chromeRunTime(cleanUrl("https://html.duckduckgo.com/html/?q=" + query))

  const abortController = new AbortController()
  setTimeout(() => abortController.abort(), 10000)

  const htmlString = await fetch(
    "https://html.duckduckgo.com/html/?q=" + query,
    {
      signal: abortController.signal
    }
  )
    .then((response) => response.text())
    .catch()

  const $ = cheerio.load(htmlString)

  const searchResults = Array.from($("div.results_links_deep")).map(
    (result) => {
      const title = $(result).find("a.result__a").text()
      const link = $(result)
        .find("a.result__snippet")
        .attr("href")
        .replace("//duckduckgo.com/l/?uddg=", "")
      const content = $(result).find("a.result__snippet").text()
      const decodedLink = decodeURIComponent(link)
      return { title, link: decodedLink, content }
    }
  )

  return searchResults
}

export const webDuckDuckGoSearch = async (query: string) => {
  const results = await localDuckDuckGoSearch(query)
  const TOTAL_SEARCH_RESULTS = await totalSearchResults()
  const searchResults = results.slice(0, TOTAL_SEARCH_RESULTS)

  const isSimpleMode = await getIsSimpleInternetSearch()

  if (isSimpleMode) {
    await getOllamaURL()
    return searchResults.map((result) => {
      return {
        url: result.link,
        content: result.content
      }
    })
  }

  const docs: Document<Record<string, any>>[] = []
  for (const result of searchResults) {
    const loader = new PageAssistHtmlLoader({
      html: "",
      url: result.link
    })

    const documents = await loader.loadByURL()

    documents.forEach((doc) => {
      docs.push(doc)
    })
  }
  const ollamaUrl = await getOllamaURL()

  const embeddingModle = await defaultEmbeddingModelForRag()
  const ollamaEmbedding = new OllamaEmbeddings({
    model: embeddingModle || "",
    baseUrl: cleanUrl(ollamaUrl)
  })

  const chunkSize = await defaultEmbeddingChunkSize()
  const chunkOverlap = await defaultEmbeddingChunkOverlap()
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap
  })

  const chunks = await textSplitter.splitDocuments(docs)

  const store = new MemoryVectorStore(ollamaEmbedding)

  await store.addDocuments(chunks)

  const resultsWithEmbeddings = await store.similaritySearch(query, 3)

  const searchResult = resultsWithEmbeddings.map((result) => {
    return {
      url: result.metadata.url,
      content: result.pageContent
    }
  })

  return searchResult
}
