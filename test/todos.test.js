const { ObjectId } = require("mongodb")
const request = require("supertest")
const app = require("../src/app")
const { connectToDB, closeConnection, getDB } = require("../src/database")

const baseUrl = "/todos"

beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const MONGODB_DB = process.env.MONGODB_DB || 'mytodos-test'

    await connectToDB(MONGODB_URI, MONGODB_DB)
})

afterAll(async () => {
    closeConnection()
})

afterEach(async () => {
   const db = getDB()
   await db.dropCollection("todos")
})

beforeEach(async () => {
    const db = getDB()
   await db.createCollection("todos")
})

describe("GET /todos", () => {
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.statusCode).toBe(200)
    })

    test("should respond with JSON", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with list of existing todos containing todo1", async () => {
        
        const todo1 = {
            title: 'Todo 1',
            completed: false,
            createdAt: '2022-01-20T09:54:48.139Z',
            updatedAt: '2022-01-20T09:54:48.139Z'
        };
        const todo2 = {
            title: 'Todo 2',
            completed: true,
            createdAt: '2022-02-20T09:54:48.139Z',
            updatedAt: '2022-02-20T09:54:48.139Z'
        };

        await insert1todo(todo1)
        await insert1todo(todo2)

        const response = await request(app.callback()).get(baseUrl)
        expect(response.type).toBe("application/json")
        expect(response.body).toMatchObject([todo1, todo2])
    })
})

describe("POST /todos", () => {
    test("should respond with a 200 status code", async () => {
        const todo1 = {
            title: 'Todo 1',
            completed: false
        }

        const response = await request(app.callback()).post(baseUrl).send(todo1)
        expect(response.statusCode).toBe(200)
        expect(response.text).toMatch(/{\"id\":\".{24}\"}/)


        const id = response.body.id
        const db = getDB()
        expect(await db.collection("todos").findOne({_id: ObjectId(id)})).toMatchObject(todo1)
    })

    test("should respond with a 422 status code (no todo title)", async () => {
        const todo1 = {
            completed: false,
            createdAt: '2022-01-20T09:54:48.139Z',
            updatedAt: '2022-01-20T09:54:48.139Z'
        }

        const response = await request(app.callback()).post(baseUrl).send(todo1)
        expect(response.statusCode).toBe(422)
        expect(response.body).toEqual({ errorMsg: "Missing parameter 'title'" })
    })

    test("should respond with a 422 status code (null todo title)", async () => {
        const todo1 = {
            title: null,
            completed: false,
            createdAt: '2022-01-20T09:54:48.139Z',
            updatedAt: '2022-01-20T09:54:48.139Z'
        }

        const response = await request(app.callback()).post(baseUrl).send(todo1)
        expect(response.statusCode).toBe(422)
        expect(response.body).toEqual({ errorMsg: "Missing parameter 'title'" })
    })

    test("should respond with a 422 status code (empty todo title)", async () => {
        const todo1 = {
            title: '',
            completed: false,
            createdAt: '2022-01-20T09:54:48.139Z',
            updatedAt: '2022-01-20T09:54:48.139Z'
        }

        const response = await request(app.callback()).post(baseUrl).send(todo1)
        expect(response.statusCode).toBe(422)
        expect(response.body).toEqual({ errorMsg: "Missing parameter 'title'" })
    })

})

describe("DELETE /todos", () => {
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).delete(baseUrl).send(todo1)
    })
})

async function insert1todo(todo) {
   
    const db = getDB()

    await db.collection("todos").insertOne(todo)

    console.log("1 todo inserted");
}