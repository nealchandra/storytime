import { kv } from '@vercel/kv';
import { Inngest } from "inngest";
import * as lo from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import * as util from 'util';
import { v4 as uuidv4 } from 'uuid';
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const systemPrompt = () => `
You are the beloved author of childrens story books. You are going to write a children's story based on some guidance I provide to you.
`

const charactersSection = (characters: string[]): string => {
  var text = ""
  for (var n = 0; n < characters.length; n++) {
    text += `CHARACTER DESCRIPTION ${n}: ${characters[n]}\n`
  }
  return text
}

const subjectsSection = (subjects: string[]): string => {
  var text = ""
  for (var n = 0; n < subjects.length; n++) {
    text += `SUBJECT DESCRIPTION ${n}: ${subjects[n]}\n`
  }
  return text
}

const outlinePrompt = (characters: string[], subjects: string[]) => `
Please create an outline of a childrens' story consisting of around 10 plot points, each one concisely summarizing a page of the story.
The story should have an imaginative, fantasy-oriented theme.
Do not include a title.
Do not include page numbers or page headers.

Please include the following characters as main characters in the story:
${charactersSection(characters)}

Please include the following subjects or events in the story:
${subjectsSection(subjects)}`

const detailPrompt = () => `
Now, using the outline you provided above, fill in the details of the story.
Turn each sentence into 2-4 sentences.
Remember to make the story whimsical and fun, something a young child would find exciting to read.
Remember to include characters, subjects, and events from above where you can.
`

const titlePrompt = () => `
Finally, generate a title for the story.
`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {  
  console.log(`Request: ${req.url}, ${req.method}, ${util.inspect(req.body)}, ${util.inspect(req.query)}`)
  
  const hdl = lo.get(handlers, req.method, (_req: NextApiRequest, res: NextApiResponse) => {
    res.status(405).json({ statusCode: 405, message: "Method Not Allowed" })
  })

  return hdl(req, res)
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { characters, subjects } = req.body
    const storytime = new StorytimeService()
    const createResponse = await storytime.startCreateStory({characters, subjects})

    res.status(200).json(createResponse)
  } catch (err: any) {
    console.log(`Caught error: ${util.inspect(err)}`)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { storyId } = req.query
    const storytime = new StorytimeService()
    const getResponse = await storytime.getStory({storyId: storyId as string})

    res.status(200).json(getResponse)
  } catch (err: any) {
    console.log(`Caught error: ${util.inspect(err)}`)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

const handlers = {
  "POST": handlePost,
  "GET": handleGet,
}

export default handler

export class StorytimeService {
  getStoryKey(storyId: string): string {
    return `story:${storyId}`
  }

  async startCreateStory(req: StartCreateStoryRequest): Promise<StartCreateStoryResponse> {
    const storyId = uuidv4()
    const { characters, subjects } = req
    
    const storyKey = this.getStoryKey(storyId)
    const storyInitialValue: StorytimeStory = {
      state: "PENDING",
      input: {
        characters,
        subjects
      },
      data: {
        story: null,
        title: null
      }
    }
    console.log(`Initialize story record for ${storyKey}: ${util.inspect(storyInitialValue)}`) 
    
    // TODO: kv should be injected.
    await kv.hset(storyKey, storyInitialValue);

    const inngest = new Inngest({
      name: "Storytime",
    });

    await inngest.send({
      name: "stories.create",
      data: {
        storyId,
        characters,
        subjects
      }
    });

    return {storyId}
  }

  async getStory(req: GetStoryRequest): Promise<GetStoryResponse> {
    const storyKey = this.getStoryKey(req.storyId)
    
    // TODO: kind of dumb should just be a single kv.get
    const story = await kv.hget(storyKey, "data") as {story: string, title: string}
    const input = await kv.hget(storyKey, "input") as {characters: string[], subjects: string[]}
    const state = await kv.hget(storyKey, "state") as StorytimeStoryState

    if (!state || !story || !input) {
      throw new Error(`Story ${req.storyId} not found`)
    }

    return {
      state,
      input,
      data: story    
    }
  }

  async createStory(req: CreateStoryRequest) {
    const { storyId, characters, subjects } = req
    const storyKey = this.getStoryKey(storyId)
    
    const inspectCompletion = (completion: any) => {
      return `${completion.status} ${completion.statusText} ${util.inspect(completion.data)}`
    }

    try {
      const messages = [
        {role: "system", content: systemPrompt()},
      ]

      messages.push({role: "user", content: outlinePrompt(characters, subjects)})
      console.log(`Summary prompt: ${util.inspect(messages)}`)

      const summaryCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      
      console.log(`Summary response: ${inspectCompletion(summaryCompletion)}`)
      const summaryMessage = summaryCompletion.data.choices[0].message
      messages.push(summaryMessage)
      messages.push({role: "user", content: detailPrompt()})
      console.log(`Detail prompt: ${util.inspect(messages)}`)
      
      const detailCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      console.log(`Detail response: ${inspectCompletion(detailCompletion)}`)

      const storyMessage = detailCompletion.data.choices[0].message
      messages.push(storyMessage)
      messages.push({role: "user", content: titlePrompt()})
      console.log(`Title prompt: ${util.inspect(messages)}`)

      const titleCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      console.log(`Title response: ${inspectCompletion(titleCompletion)}`)
      
      const titleMessage = lo.trim(titleCompletion.data.choices[0].message.content, "\"")
      const response = {
        story: storyMessage.content, 
        title: titleMessage
      }

      const storyFinalValue = {
        state: "DONE",
        input: {
          characters: req.characters,
          subjects: req.subjects
        },
        data: {
          ...response
        }
      }

      // Design-wise, this should probably better to keep out of here. Easier to test.
      console.log(`Save final story value for ${storyKey}: ${util.inspect(storyFinalValue)}`) 
      await kv.hset(storyKey, storyFinalValue);
    } catch (ex: any) {
      console.log(`Caught exception: ${util.inspect(ex)}`)
      const failedFinalValue = {
        state: "FAILED",
        input: {
          characters: req.characters,
          subjects: req.subjects
        },
      }
      await kv.hset(storyKey, failedFinalValue);
      throw ex
    }
  }
}

type CreateStoryRequest = {
  storyId: string
  characters: string[]
  subjects: string[]
}

type StartCreateStoryRequest = {
  characters: string[]
  subjects: string[]
}

type StartCreateStoryResponse = {
  storyId: string
}

type GetStoryRequest = {
  storyId: string
}

type StorytimeStoryState = "PENDING" | "DONE" | "FAILED"

type StorytimeStory = {
  state: StorytimeStoryState
  input: {
    characters: string[]
    subjects: string[]
  },
  data: {
    story: string
    title: string
  }
}

type GetStoryResponse = StorytimeStory
