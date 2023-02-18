import jwt from "jsonwebtoken";

// функция проверки существования авторизованного пользователя
const validateToken = (req, res, next) => {
    //вытаскиваем токен
    const accessToken = req.header("accessToken");
    
    //если токен пустой то выводим сообщение, что авторизованного пользователя не существует
    if (!accessToken) return res.json({error: "User not logged in!"});

    try
    {
        //вытаскиваем токен по ключевому слову importantsecret

        const validToken = jwt.verify(accessToken, "importantsecret");
        
        //получилось вытащить токен и сфомировать данные авторизованного пользователя
        req.user = validToken;
        if (validToken)
        {
            //идем дальше по соответствующим машрутизаторам которые обращаются к функции validateToken
            return next();
        }
    }
    catch (err)
    {
        //не получилось вытащить токен и сфомировать данные авторизованного пользователя
        return res.json({error: err});
    }
}

export default validateToken;