import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по лайкам
import LikesModel from "../models/Likes.js";
import PostsModel from "../models/Posts.js";
//вытаскиваем функцию определения данных по авторизованному пользователю
import validateToken from "../middlewares/AuthMiddleware.js";

//маршрутизатор запроса на изменение количества лайков в базе данных лайков на сервере
router.post("/", validateToken, async (req, res) => {
    try
    {
        //определяем существует ли в базе данных лайков лайк с идентификатором поста postId и идентификатором пользователя userId 
        const foundLike = await LikesModel.findOne({
            post: req.body.post,
            user: req.user.id
        });

        const post = await PostsModel.findOne({_id: req.body.post});

        let listOfPosts;

        if (!foundLike) 
        {
            //указанный лайк не существует, тогда в базе данных лайков создаем новый лайк 
            //с идентификатором поста postId и идентификатором пользователя userId 
            const doc = new LikesModel({
                post: req.body.post,
                user: req.user.id
            });

            await doc.save();
         
            await PostsModel.updateOne(
                {
                    _id: req.body.post
                },
                {
                    countOfLikes: post.countOfLikes + 1
                }
            );

            listOfPosts = await PostsModel.find().exec();
        } 
        else 
        {
            //указанный лайк существует, тогда в базе данных лайков удаляем этот лайк 
            //с идентификатором поста postId и идентификатором пользователя userId 
            LikesModel.findOneAndDelete(
            {
                post: req.body.post,
                user: req.user.id
            },
            (err, doc) => {
            });

            await PostsModel.updateOne(
                {
                    _id: req.body.post
                },
                {
                    countOfLikes: post.countOfLikes - 1
                }
            );
            listOfPosts = await PostsModel.find().exec();            
        }
        res.json(listOfPosts);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

export default router;