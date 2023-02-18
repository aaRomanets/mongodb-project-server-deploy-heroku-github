import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по данным поста
import PostsModel from '../models/Posts.js';
//вытаскиваем модель базы данных по данным лайка
import LikesModel from '../models/Likes.js';

//вытаскиваем функцию определения данных по авторизованному пользователю
import validateToken from "../middlewares/AuthMiddleware.js";

//маршрутизатор запроса на получение всех постов и лайков авторизованного пользователя
router.get("/", validateToken, async (req, res) => {
    //получаем список всех постов
    const listOfPosts = await PostsModel.find().exec();
    //получаем требуемый список лайков с идентификатором авторизованного пользователя req.user.id
    const likedPosts = await LikesModel.find({user: req.user.id});
    //отправляем результат на клиент-приложение проекта
    res.json({listOfPosts: listOfPosts , likedPosts: likedPosts});
});

//маршрутизатор запроса на скачивание с сервера информации о посте с идентификатором id
router.get('/byId/:id', async (req, res) => {
    try
    {    
        //вытаскиваем идентификатор поста
        const id = req.params.id;
        //определяем информацию о посте с идентификатором Id из всей базы данных Post
        const post = await PostsModel.findById(id);
        //отправляем на клиент приложение полученную информацию о посте с идентификатором id
        res.json(post);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на получение постов пользователя с заданным идентификатором
router.get('/byuserId/:id', async (req, res) => {
    //определяем идентификатор пользователя посты которого будем вытаскивать из базы данных Posts
    const id = req.params.id;
    //вытаскиваем все посты пользователя с идентификатором id из базы данных PostsModel
    const listOfPosts = await PostsModel.find({user: id}).exec();
    //отправляем все найденные посты на клиент-приложение
    res.json(listOfPosts);
})

//маршрутизатор запроса на создание нового поста авторизованным пользователем
router.post("/", validateToken, async (req, res) => {
    try 
    {      
        const doc = new PostsModel({
            //заголовок поста
            title: req.body.title,
            //текстовое содержимое поста
            postText: req.body.postText,
            //имя пользователя
            username:  req.user.username,
            //идентификатор пользователя, который составил этот пост
            user: req.user.id,
            countOfLikes: 0
        })

        //фиксируем новый пост в базе данных
        const post = await doc.save();

        //отправляем результат на клиент приложение проекта
        return res.json(post);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'Could not create the post'
        })
    }
})

//маршрутизатор запроса на сервер на изменение названия поста 
router.put("/title", validateToken, async (req, res) => {
    try
    {
        //вытаскиваем название поста которое будем менять и сам идентификатор поста id
        const {newTitle, id} = req.body;
        //меняем название поста с определенным идентификатором id
        await PostsModel.updateOne(
            {
                _id: id
            },
            {
                title: newTitle
            }
        );
        //само новое название поста отправляем на клиент-приложение проекта
        return res.json(newTitle);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на сервер на изменение содержания поста 
router.put("/postText", validateToken, async (req, res) => {
    try
    {
        //вытаскиваем содержание поста которое будем менять и сам идентификатор поста id
        const {newText, id} = req.body;
        //меняем содержание поста с определенным идентификатором id
        await PostsModel.updateOne(
            {
                _id: id
            },
            {
                postText: newText
            }
        );
        //само новое содержание поста отправляем на клиент-приложение проекта
        return res.json(newText);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на сервер на удаление поста из базы данных Posts
router.delete("/:id", validateToken, async (req, res) => {
    try
    {
        //вытаскиваем идентификатор удаляемого поста
        const postId = req.params.id;

        //удаляем соответствующий пост
        PostsModel.findOneAndDelete(
            {
                _id: postId
            },
            (err, doc) => 
            {
                //ошибка при удалении поста
                if (err) 
                {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Could not delete the post'
                    })
                }
                //пост, который нужно удалить не найден
                if (!doc) {
                    return res.status(404).json({
                        message: 'Post not found'
                    })
                }
                //пост задания, который нужно удалить, удален
                res.json("Post was deleted!");
            }
        )
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

export default router;