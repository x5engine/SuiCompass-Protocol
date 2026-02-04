declare module '@embedapi/core' {
  export class EmbedAPIClient {
    constructor(apiKey: string)
    generate(options: {
      prompt: string
      model?: string
      temperature?: number
      maxTokens?: number
    }): Promise<any>
    stream(options: {
      prompt: string
      model?: string
      temperature?: number
    }): AsyncIterable<any>
  }
}

