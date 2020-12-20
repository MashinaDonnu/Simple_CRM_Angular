const {Router} = require('express')
const controller = require('../controllers/analytics')
const passport = require('passport')
const router = Router()

router.get('/overview', passport.authenticate('jwt', {session: false}), controller.overview)
router.get('/analytics', passport.authenticate('jwt', {session: false}), controller.analytics)

module.exports = router
