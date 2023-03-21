import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по данным пользователя
import UsersModel from "../models/Users.js";
import bcrypt from "bcrypt";
//вытаскиваем функцию определения данных по авторизованному пользователю
import validateToken from "../middlewares/AuthMiddleware.js"; 
import jwt from "jsonwebtoken";

//маршрутизатор запроса по регистрации пользователя
router.post("/", async (req, res) => {
    try 
    {     
        //проверяем есть ли регистрируемый пользователь в базе данных
        UsersModel.findOne({username: req.body.username}, (err, userExist) => 
        {
            //существующего пользователя удаляем из базы данных
            if (userExist != undefined)
            {
                UsersModel.findOneAndDelete(
                {
                    username: req.body.username
                },
                (err, doc) => {
                });
            }

            //hash the password   
            bcrypt.hash(req.body.password,10).then((hashedPassword) => 
            {
                //create a new user instance and collect the data
                const user = new UsersModel({
                    username: req.body.username,
                    password: hashedPassword
                });

                //save the new user
                user.save()
                //return success if the new user is added to the database successfully
                .then((_) => {
                    res.json("SUCCESS");
                })
                //catch error if the new user wasn't added successfully to the database
                .catch((error) => {
                    res.status(500).send({
                        message: "Error creating user",
                        error
                    })
                })
            })
            //catch error if the password hash isn't successfull
            .catch((e) => {
                res.status(500).send({
                    message: "Password was not hashed successfully",
                    e
                })
            })
        })
    } 
    catch (e) 
    {
        console.log(e);
        res.send({message: "Server error"})
    }
})

//маршрутизатор запроса по авторизации зарегистрированного пользователя
router.post("/login", async (req, res) => {
    try
    {
        //ищем пользователя с именем username по всей базе данных пользователей
        const user = await UsersModel.findOne({username: req.body.username});

        //если пользователя нет, то выводим сообщение что требуемый пользователь не найден
        if (!user) res.json({error: "User Doesn't Exist"});

        //Проверяем правильность пароля авторизируемого пользователя
        const isValidPass = await bcrypt.compare(req.body.password, user.password);
    
        if (!isValidPass) {
            return req.status(400).json({
                message: 'Wrong Username And Password Combination'
            })
        }

        //составляем токен авторизируемого пользователя по его имени user.username и идентификатору user.id
        const accessToken = jwt.sign(
            {username: user.username, id: user.id}, 
            "importantsecret"
        );

        //отправляем на клиент-приложение все данные об авторизированном пользователе
        res.json({token: accessToken, username: user.username, id: user.id});
    }
    catch (err) 
    {
        res.status(500).json({
            message: 'Failed to log in'
        });
    }
})

//маршрутизатор запроса на проверку существования авторизированного пользователя
router.get("/auth", validateToken, async (req, res) => {
    try
    {
        //из базы данных MongoDb собираем все данные по пользователю с идентификатором req.userId
        const user = await UsersModel.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }
        res.json(user._doc);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на получение основной информации по пользователю с заданным идентификатором
router.get("/basicInfo/:id", async (req, res) => {
    try
    {
        //определяем идентификатор интересуемого пользователя
        const id = req.params.id;

        //из базы данных MongoDb собираем все данные по пользователю с идентификатором req.userId
        const user = await UsersModel.findById(id);

        if (!user)
        {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }

        //собираем все данные по пользователю с идентификатором req.userId за исключением его пароля
        const {password, ...userData} = user._doc;
        const basicInfo = userData;

        //отправлем на клиент часть все данные по пользователю с идентификатором id
        res.json(basicInfo);
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор по запросу на изменение пароля по авторизируемому пользователю
router.put('/changepassword', validateToken, async (req, res) => {
    try
    {
        //вытаскиваем старый и новый пароль
        const {oldPassword, newPassword} = req.body;
        //во всей моделе базы данных по пользователям находим данные по пользователю с именем req.user.username и паролем oldPassword
        const user = await UsersModel.findOne({username: req.user.username});

        //сравниваем новый пароль со старым
        bcrypt.compare(oldPassword, user.password).then( async (match) => {
            if (!match) res.json({error: "Wrong Password Entered!"});

            //шифруем новый пароль
            bcrypt.hash(newPassword, 10).then(async (hash) => {
                //в модели базы данных пользователя с именем req.user.username 
                //старый зашифрованный пароль меняем на новый зашифрованный пароль
                await UsersModel.updateOne(
                    {
                        _id: req.user._id
                    },
                    {
                        password: hash
                    }
                );
                res.json("SUCCESS");
            })
        })
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

export default router;