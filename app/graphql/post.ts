import { Helper } from '@app/utils';
import { objectType, extendType, nonNull, stringArg } from 'nexus';
import AuthMiddleware from '../middlewares/auth.middleware';

export const Comment = objectType({
    name: 'Comment',
    definition(t) {
        t.nonNull.string('username');
        t.nonNull.string('body');
    },
});

export const Like = objectType({
    name: 'Like',
    definition(t) {
        t.nonNull.string('username');
    },
});

export const Post = objectType({
    name: 'Post',
    definition(t) { 
        t.nonNull.string('id');
        t.nonNull.string('body');
        t.nonNull.string('username');
        t.list.nonNull.field("comments", {
            type: "Comment",
        });
        t.list.nonNull.field("likes", {
            type: "Like",
        });
        t.nonNull.field("user", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.post
                    .findUnique({ where: { id: parent.id } })
                    .user();
            },
        });
    },
});

export const PostQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('getPosts', {
            type: 'Post',
            resolve(parent, args, context) {
                return context.prisma.post.findMany();
            },
        });
    },
});

export const PostMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('createPost', {
            type: 'Post',
            args: {
                body: nonNull(stringArg()),
            },

            async resolve(parent, args, context) {
                const { body } = args;
                const user = await AuthMiddleware.userAuth(context);

                const post = await context.prisma.post.create({
                    data: {
                        body,
                        username: user.username,
                        user: { connect: { id: user.id } }
                    }
                });

                return post;
            },
        });
    },
});