const {Router} = require('express')
const controller = require('../controllers/order')
const router = Router()
const passport = require('passport')

router.get('/', passport.authenticate('jwt', {session: false}), controller.getAll)
router.post('/', passport.authenticate('jwt', {session: false}), controller.create)

module.exports = router
