const Router = require("koa-router")

const router = Router({ prefix: "/todos" })
const { getDB } = require("./database")

router
    .get("/", listTodos)
    .post("/", createTodo)
    .put("/:id", updateTodo)
    .del("/:id", deleteTodo)

async function listTodos (ctx) {
    const todos = await getDB()
        .collection("todos")
        .find({})
        .sort({ _id: 1 })
        .toArray()

    ctx.body = todos
}

async function createTodo (ctx) {
    const title = ctx.request.body.title

    if (title === null || title === undefined || title === '') {
        ctx.status = 422
        ctx.body = { errorMsg: "Missing parameter 'title'" }
    } else {
        const result = await getDB().collection("todos").insertOne({
            title,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        ctx.body = { id: result.insertedId }
    }
}

async function deleteTodo (ctx) {
    // await getDB.collection("todos").deleteOne()
}

async function updateTodo (ctx) {
    // TODO
}

module.exports = router
