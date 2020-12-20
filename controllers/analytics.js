const moment = require('moment')
const Order = require('../models/Order')
const errorHandler = require('../utils/errorHandler')

module.exports.overview = async function(req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1}) // sort(1) - сортировка по возрастанию
        const ordersMap = getOrdersMap(allOrders)
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || []

        // количество заказов за вчера
        const yesterdayOrdersNumber = yesterdayOrders.length
        // заказов всего
        const totalOrdersNumber = allOrders.length
        // всего дней
        const daysNumber = Object.keys(allOrders).length
        // среднее количество заказов в день
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0)
        // процент для количества заказов
        const ordersPercent = (((yesterdayOrdersNumber / ordersPerDay) - 1) * 100).toFixed(2)
        // общая выручка
        const totalGain = calculatePrice(allOrders)
        // выручка в день
        const gainPerDay = totalGain / daysNumber
        // выручка за вчера
        const yesterdayGain = calculatePrice(yesterdayOrders)
        // процент выручки
        const gainPercent = (((yesterdayGain / gainPerDay) - 1) * 100).toFixed(2)
        // сравнение выручки
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2)
        // сравнение количества заказов
        const compareOrders = (yesterdayOrdersNumber - ordersPerDay).toFixed(2)

        res.status(200).json({
            gain: {
                percent: Math.abs(+gainPercent),
                compare: Math.abs(+compareGain),
                yesterday: +yesterdayGain,
                isHigher: +gainPercent > 0
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareOrders),
                yesterday: +yesterdayOrdersNumber,
                isHigher: +ordersPercent > 0
            }
        })

    } catch (err) {
        errorHandler(res, err)
    }

}

module.exports.analytics = async function(req, res) {

    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const orderMap = getOrdersMap(allOrders)

        const average = +(calculatePrice(allOrders) / Object.keys(orderMap).length).toFixed(2)

        const chart = Object.keys(orderMap).map(label => {
            const gain = calculatePrice(orderMap[label])
            const orders = orderMap[label].length

            return {label, gain, orders}
        })

        res.status(200).json({average, chart})

    } catch (err) {
        errorHandler(res, err)
    }
}

function getOrdersMap(allOrders = []) {
    const daysOrders = {}
    allOrders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYY')
        if (!daysOrders[date]) {
            daysOrders[date] = []
        }
        daysOrders[date].push(order)
    })
    return daysOrders
}

function calculatePrice(orders = []) {
    return orders.reduce((total, order) => {
        const orderPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += (item.cost * item.quantity)
        }, 0)
        return total += orderPrice
    }, 0)
}
