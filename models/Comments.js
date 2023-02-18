import mongoose from "mongoose";

const CommentsSchema = new mongoose.Schema({
    //идентификатор поста в котором создаются комментарии
    post: {
        type: String,
        required: true
    },
    //имя пользователя, который создал комментарий
    username: {
        type: String,
        required: true
    },    
    //содержание комментария
    commentBody: { 
        type: String, 
        required: true
    },
}, {
    timestamps: true
})

export default mongoose.model('Comments', CommentsSchema);