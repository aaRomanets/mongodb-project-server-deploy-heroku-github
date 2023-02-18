import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

//external imports
import mongoose from "mongoose";

//подключаем базу данных Mongo DB
mongoose.connect(
    process.env.DB_URL,
    {
        //these are options to ensure that the connection is done properly
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
)
.then(() => 
{
     console.log("Successfully connected to MongoDB Atlas!")        
})
.catch((error) => 
{
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
})  

const app = express();
//ответ с роутеров будет приходить в формате json
app.use(express.json());
//включаем возможность перехода с одного локального адреса на другой
app.use(cors());

//задаем порт сервера
const PORT = process.env.PORT || 4001;

//маршрутизаторы
import postRouter from './routes/Posts.js';
//подключаем маршрутизаторы запросов по постам
app.use("/posts", postRouter);

import commentsRouter from "./routes/Comments.js";
//подключаем маршрутизаторы запросов по комментариям
app.use("/comments", commentsRouter);

import usersRouter from "./routes/Users.js";
//подключаем маршрутизаторы запросов по пользователям
app.use("/auth", usersRouter);

import likesRouter from "./routes/Likes.js";
//подключаем маршрутизаторы запросов по лайкам
app.use("/likes", likesRouter);

const start = async () => {
    try 
    {        
        //запускаем сервер
        await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    }
    catch (e) {
        console.log(e);
    }
} 

start();