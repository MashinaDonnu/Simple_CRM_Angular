const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')

module.exports.login = async function(req, res) {
    console.log(req.body)
    const candidate = await User.findOne({email: req.body.email})
    if (candidate) {
        // console.log(req.body.password, '----', candidate)
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
        if (passwordResult) {
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60})
            res.status(200).json({
                token: `Bearer ${token}`
            })
        } else {
            console.log(111111111)
            res.status(401).json({
                message: 'Invalid password. Try again.'
            })
        }
    } else {
        res.status(404).json({message: `Email: "${req.body.email}" not found.`})
    }
}


module.exports.register = async function(req, res) {

    const candidate = await User.findOne({email: req.body.email})

    if (candidate) {
        res.status(409).json({
            message: `${req.body.email} already exist. Try again.`
        })
    } else {
        const password = req.body.password
        const salt = bcrypt.genSaltSync(10)
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        })

        try {
            await user.save()
            res.status(201).json({
                message: 'User created!',
                user
            })
        } catch (err) {
            errorHandler(res, err)
        }
    }
}
