import mongoose from "mongoose";

const LikesSchema = new mongoose.Schema({
    //идентификатор поста к которому ставится лайк
    post: {
        type: String,
        required: true
    },
    //идентификатор зарегистрированного пользователя
    user: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model('Likes', LikesSchema);