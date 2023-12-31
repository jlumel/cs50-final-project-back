import Users from '../models/Users.model.js'
import { logger, errorLog } from '../service/logger.service.js'
import { createHash, validatePassword } from '../utils.js'

const userController = {

    registerUser: async (req, res) => {

        // Register User in DB

        const { username, password, password2 } = req.body
        try {
            const user = await Users.findOne({ username: username }).exec()

            if (user) {
                res.status(400).json({ message: 'User already exists' })
            } else if (username && password && password2) {
                if (password !== password2) {
                    return res.status(400).json({ message: 'Passwords do not match' })
                }
                const hash = createHash(password)
                const newUser = new Users({ username: username, password: hash })

                newUser.save()
                    .then(() => res.json({ message: "User registered correctly" }))
                    .catch(err => {
                        errorLog(err)
                        res.status(500).json({ error: "Internal server error" })
                    })

            } else {
                res.status(400).json({ message: 'All fields are required' })
            }
        } catch (err) {

            errorLog(err)
            res.status(500).json({ error: "Internal server error" })
        }
    },
    loginUser: async (req, res) => {

        // Log in user and start session

        let { username, password } = req.body
        try {
            const user = await Users.findOne({ username: username }).exec()

            if (!user) {
                res.status(400).json({ message: 'User does not exist' })
            } else {
                if (!validatePassword(user.password, password)) {
                    res.status(403).json({ message: 'Invalid password' })
                } else {
                    req.session.user = user
                    process.env.DEV_ENVIRONMENT && logger.info("Signed in")
                    res.json({ isLogged: true, username })
                }
            }
        } catch (err) {

            errorLog(err)
            res.status(500).json({ error: "Internal server error" })
        }
    },
    logoutUser: (req, res) => {

        // Log out and end session

        req.session.destroy(function (err) {
            if (err) {
                errorLog(err)
                res.status(500).json({ error: "Internal server error" })
            } else {
                res.json({ message: "Logged out successfully" })
            }
        })
        process.env.DEV_ENVIRONMENT && logger.info("Logged out")

    },
    getSessionInfo: (req, res) => {

        if (req.session.user && req.session.user.username) {
            res.json({ isLogged: true, username: req.session.user.username })
        } else {
            res.json({ isLogged: false, username: "" })
        }
    },
    changePassword: async (req, res) => {

        const userId = req.session.user._id

        const newPassword = req.body.newPassword

        try {

            await Users.findOneAndUpdate({ _id: userId }, { password: createHash(newPassword) })

            res.json({ message: "Password updated successfully" })

        } catch (err) {
            errorLog(err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }
}

export default userController