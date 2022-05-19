import { Helper } from '@app/utils';
import { objectType, extendType, nonNull, stringArg } from 'nexus';
import AuthMiddleware from '../middlewares/auth.middleware';

export const User = objectType({
    name: 'User',
    definition(t) {
        t.nonNull.string('id');
        t.nonNull.string('email');
        t.nonNull.string('username');
        t.string('password');
        t.list.field("posts", {
            type: "Post",
            resolve(parent, args, context) {
                return context.prisma.user
                    .findUnique({ where: { id: parent.id } })
                    .posts();
            },
        });
    },
});

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user", {
            type: "User",
        });
    },
});

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('users', {
            type: 'User',
            resolve(parent, args, context) {
                return context.prisma.user.findMany();
            },
        });
    },
});

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('signup', {
            type: 'User',
            args: {
                email: nonNull(stringArg()),
                username: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },

            async resolve(parent, args, context) {
                await AuthMiddleware.checkIfEmailAlreadyExist(context, args);
                const { email, username, password: newPassword } = args;
                const hash = Helper.hashPassword(newPassword);

                const user = await context.prisma.user.create({
                    data: {
                        email, username, password: hash
                    }
                })
                const { password, ...newUser } = user;
                return newUser;
            },
        });

        t.nonNull.field('login', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },

            async resolve(parent, args, context) {
                const user = await AuthMiddleware.checkIfEmailExist(context, args);
                const validUser = await AuthMiddleware.comparePassword(user, args);
                const { id, username, email } = validUser;
                const token = Helper.generateToken({ id, username, email })
                return {
                    token,
                    user: validUser
                }
            }
        });
    },
});

