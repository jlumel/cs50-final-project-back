import Accounts from '../models/accounts.model.js'
import Transactions from '../models/Transactions.model.js'

const accountsController = {

    getAccounts: async (req, res) => {

        // get all accounts from a user

        const userId = req.session.user._id

        try {
            const accounts = await Accounts.find({ userId })
            res.json(accounts)
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' })
        }

    },
    getAccountById: async (req, res) => {

        // get an account by id

        const userId = req.session.user._id
        const { id } = req.params

        try {
            const account = await Accounts.find({ userId, _id: id }).exec()
            res.json(account)
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' })
        }

    },
    createAccount: (req, res) => {

        // create a new account

        const userId = req.session.user._id

        const { name, currencyAcronym } = req.body

        if (name && currencyAcronym) {

            const account = {
                name,
                userId,
                currencyAcronym,
                balance: 0
            }

            const newAccount = new Accounts(account)

            newAccount.save()
                .then(async () => {

                    res.status(201).json({ message: "Account created successfully" })
                })
                .catch(err => {
                    return res.status(400).json({ error: "The transaction could not be added" })
                })
        } else {
            return res.status(400).json({ message: "Information is missing" })
        }

    },
    modifyAccount: async (req, res) => {

        // modify an account by id

        const { id } = req.params

        try {

            const oldAccount = await Accounts.findOne({ _id: id })

            const account = {}

            for (const key in req.body) {
                account[key] = req.body[key]
            }
            await Accounts.findOneAndUpdate({ _id: id },
                {
                    $set: { ...account }
                }
            )

            if (req.body.name) {

                await Transactions.updateMany({ userId: req.session.user._id, accountName: oldAccount.name }, { accountName: req.body.name })
            }

            res.json({ message: "Account updated successfully" })

        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' })
        }

    },
    deleteAccount: async (req, res) => {

        // delete an account by id. Get the name to check if it has related transactions

        const { id } = req.params
        const { name } = req.body

        try {
            const count = await Transactions.countDocuments({ accountName: name })
            if (count) {
                return res.status(400).json({ message: "The account has related transactions. Delete them first to delete the account" })
            }

            try {
                await Accounts.deleteOne({ _id: id })

                res.json({ message: "Account deleted successfully" })

            } catch (err) {
                return res.status(500).json({ error: 'Internal server error' })
            }

        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' })
        }
    },
    isLogged: (req, res) => {

        if (req.session && req.session.user) {
            console.log(req.session)
            res.json({ isLogged: true, username: req.session.user.username })
        } else {
            console.log(req.session)
            res.json({ isLogged: false, username: "" })
        }
    }

}

export default accountsController