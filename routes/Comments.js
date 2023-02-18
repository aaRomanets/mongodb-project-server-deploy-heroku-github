import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по комментариям
import CommentsModel from "../models/Comments.js";
//вытаскиваем функцию определения данных по авторизованному пользователю
import validateToken from "../middlewares/AuthMiddleware.js";

//маршрутизатор запроса на скачивание с сервера комментариев к посту с идентификатором postId 
router.get('/:id', async (req, res) => {
    try
    {
        //определяем идентификатор поста по которому будем скачивать комментарии
        const post = req.params.id;
        //определяем комментарии по посту с идентификатором postId в базе данных комментариев Comments
        const comments = await CommentsModel.find({ post: post }).exec();
        //отправляем определенные комментарии на клиент-приложение проекта
        res.json(comments); 
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на сервер на добавление нового комментария в базу данных комментариев Comments
router.post("/", validateToken, async(req, res) => {
    try
    {
        const comment = new CommentsModel({
            //Идентификатор поста в котором создается комментарий
            post: req.body.post,
            //имя пользователя, который создал комментарий
            username:  req.user.username,
            //содержание создаваемого комментария
            commentBody: req.body.commentBody,
        })
        await comment.save();
        res.json(comment);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'the comment was not added'
        })
    }
})

//маршрутизатор запроса на сервер по удалению комментария
router.delete("/:id", validateToken, async (req, res) => {
    try
    {
        //ищем удаляемыйкомментаий в модели комментариев CommentsModel
        const commentExist = await CommentsModel.findOne({ _id: req.params.id});
        if (commentExist)
        {
            //удаляем соответствующий комментарий из базы данных комментариев
            CommentsModel.findOneAndDelete(
            {   
                _id: req.params.id
            },
            () => {
                //фиксируем сообщение о том, что требуемое удаление успешно завершено
                res.json("DELETED SUCCESSFULLY");
            });
        }
        else
        {
            res.json("COMMENT NOT FOUNDED"); 
        }
    }
    catch (err)
    {
        res.status(500).json({
            message: 'no access'
        })
    }
})

export default router;