const config = {
    secret: process.env.SECRET || 'local_secret',
    env: process.env.ENV || 'development',
    db: {
        dbUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
        dbName: process.env.DB_NAME || 'ITStorm',
    },
    userCommentActions: {
        like: 'like',
        dislike: 'dislike',
        violate: 'violate',
    },
    requestTypes: {
        order: 'order',
        consultation: 'consultation',
    }
};

module.exports = config;