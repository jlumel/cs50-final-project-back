import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import initApp from './service/initApp.service.js'
import Users from './routes/users.route.js'
import requireAuth from './middleware/requireAuth.js'
import Transactions from './routes/transactions.route.js'
import Accounts from './routes/accounts.route.js'
import Currencies from './routes/currencies.route.js'
import Categories from './routes/categories.route.js'
import Subcategories from './routes/subcategories.route.js'
import cors from 'cors'
import initSession from './middleware/initSession.js'

const app = express()
const router = express.Router()

//Middlewares

process.env.DEV_ENVIRONMENT ? app.use(cors({credentials: true, origin: 'http://localhost:5173'})) :
app.use(cors({credentials: true, origin: 'https://lumel.dev'}))
app.use(compression())
app.use(express.json())
app.use(cookieParser())
initSession(app)
app.use('/api', router)
router.use(requireAuth)

initApp(app)

// Routes

Users(app, router)
Transactions(router)
Accounts(router)
Currencies(router)
Categories(router)
Subcategories(router)