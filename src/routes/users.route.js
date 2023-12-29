import usersController from '../controllers/users.controller.js'


const Users = (app, router) => {

    app.post('/user/register', (req, res) => {
        usersController.registerUser(req, res)
    })

    app.post('/user/login', (req, res) => {
        usersController.loginUser(req, res)
    })

    app.post('/user/logout', (req, res) => {
        usersController.logoutUser(req, res)
    })

    router.post('/user', (req, res) => {
        usersController.isLogged(req, res)
    })
}

export default Users