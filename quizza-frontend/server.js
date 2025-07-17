// server - backend
// cadastro de usuários

import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'


const prisma = new PrismaClient()

const app = express()
//Make sure we use json (body param)
app.use(express.json())
// quem pode fazer requisições ao backend/server
//está liberado para todos agora
app.use(cors())
/*
[Criando rota]
1) Tipo de rota / método http
2) Endereço
(get, post, put, patch(only one), delete)
- extensão : thunderclient - para ajudar com as rotas
*/

/*
Criar nossa API de usuários

- Criar usuários
- Listar usuarios
- Editar
- Deletar
*/

// post route
app.post('/users', async (req, res) => {
    // data that will come from frontend, from a requisition
    await prisma.user.create({
        data:{
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }
    })
    res.status(201).json(req.body)
})

//list all users
app.get('/users', async (req, res) => {
    //return something/ answer something
    let users = []
    if (req.query){
        users = await prisma.user.findMany({
            where: {
                name: req.query.name
            }
        })
    }
    else{
        users = await prisma.user.findMany()
    }
    res.status(200).json(users)
})

// Route Params(algo específico, pelo Id do user)
// update
// :id -> indica que é uma variável
app.put('/users/:id', async (req, res) => {
    // data that will come from frontend, from a requisition
    await prisma.user.update({
        where:{
            id: req.params.id
        },
        data:{
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }
    })
    res.status(201).json(req.body)
})

//Delete
app.delete('/users/:id', async (req, res) => {
    await prisma.user.delete(
        {
            where:{
                id: req.params.id
            }
        }
    )
    res.status(200).json({message: 'User successfuly deleted!'})
})
//where it is gonna run


/*
# Criar nossa API de Vagas

- Criar vagas
- Listar vagas
- Editar
- Deletar

*/

//Post
app.post('/jobs', async (req, res) => {
    await prisma.job.create(
        {
            data: {
                title: req.body.title,
                salary: req.body.salary,
                location: req.body.location
            }
        }
    )
    res.status(201).json(req.body)
})
//Get
/*
app.get('/jobs', async (req, res) => {

    const jobs = await prisma.job.findMany()

    res.status(200).json(jobs)
})
 */
app.get('/jobs', async (req, res) => {

    let jobs = []

    if(req.query){
        jobs = await prisma.job.findMany({
            where:{
                title: req.query.title
            }
        })
    } else{
        jobs = await prisma.job.findMany()
    }

    res.status(200).json(jobs)
})

//Put
app.put('/jobs/:id', async (req, res) => {
    await prisma.job.update(
        {
            where:{
                id: req.params.id
            },
            data: {
                title: req.body.title,
                salary: req.body.salary,
                location: req.body.location
            }
        }
    )
    res.status(201).json(req.body)
})

//Delete
app.delete('/jobs/:id', async (req, res) => {
    await prisma.job.delete(
        {
            where:{
                id: req.params.id
            }
        }
    )
    res.status(200).json({message: 'Job successfuly deleted!'})
})

app.listen(3000)