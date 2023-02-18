import mongoose from "mongoose";

//модель базы данных регистрируемого пользователя
const UsersSchema = new mongoose.Schema({
    //полное имя регистрируемого пользователя
    username: {
        type: String,
        required: true
    },
    //зашифрованный пароль регистрируемого пользователя
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model('Users', UsersSchema);