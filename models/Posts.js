import mongoose from "mongoose";

//модель статьи, создаваемая авторизованным пользователем
const PostsSchema = new mongoose.Schema({
    //заголовок статьи
    title: {
        type: String,
        required: true
    },
    //текстовое содержимое статьи
    postText: {
        type: String,
        required: true
    },
    //имя пользователя, который создает пост
    username: {
        type: String,
        required: true
    },
    //заголовок статьи
    countOfLikes: {
        type: Number,
        required: true
    },
    //зарегистрированный пользователь, который создал этот пост
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model('Posts', PostsSchema);