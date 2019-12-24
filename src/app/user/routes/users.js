const controller = require('../controllers/users');

module.exports = (router) => {
    router.route('/users')
        .get(controller.fetchAll);

    router.route('/users/auth/register')
        .post(controller.register);

    router.route('/users/auth/login')
        .post(controller.login);

    router.route('/users/:id')
        .get(controller.fetchOne)
        .put(controller.updateOne)
        .delete(controller.deleteOne);

    router.route('/users/:id/update-password')
        .post(controller.updatePassword);
};